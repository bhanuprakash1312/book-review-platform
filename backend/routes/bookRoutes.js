import express from 'express';
import prisma from '../lib/prisma.js';

function getRawTextUrl(formats, id) {
  return (
    formats['text/plain; charset=utf-8'] ||
    formats['text/plain; charset=us-ascii'] ||
    formats['text/plain'] ||
    null
  );
}

const router = express.Router();


router.get('/books', async (req, res) => {
  const page = req.query.page || 1;
  try {
    const gutendexRes = await fetch(`https://gutendex.com/books?page=${page}`);
    const data = await gutendexRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books from Gutendex' });
  }
});

// 2. Proxy Gutendex single book detail
router.get('/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const gutendexRes = await fetch(`https://gutendex.com/books/${id}`);
    if (!gutendexRes.ok) {
      return res.status(404).json({ error: 'Book not found' });
    }
    const bookData = await gutendexRes.json();
    res.json(bookData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch book data' });
  }
});

// 3. Get book content (plain text) cleaned
router.get('/books/:id/content', async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`[Book Content] Fetching metadata for book ID: ${id}`);
    const metaRes = await fetch(`https://gutendex.com/books/${id}`);
    if (!metaRes.ok) {
      console.error(`[Book Content] Metadata fetch failed with status: ${metaRes.status}`);
      return res.status(404).json({ error: 'Book not found' });
    }
    const bookData = await metaRes.json();

    const txtUrl = getRawTextUrl(bookData.formats, id);
    console.log(`[Book Content] Plain text URL for book ID ${id}:`, txtUrl);
    if (!txtUrl) {
      console.error(`[Book Content] No plain text format available for book ID: ${id}`);
      return res.status(404).json({ error: 'No plain text format available' });
    }

    console.log(`[Book Content] Fetching plain text from: ${txtUrl}`);
    const txtRes = await fetch(txtUrl);
    if (!txtRes.ok) {
      console.error(`[Book Content] Plain text fetch failed with status: ${txtRes.status}`);
      return res.status(500).json({ error: 'Failed to fetch book content' });
    }

    let rawText = await txtRes.text();

    // Clean Gutenberg header/footer
    const startMarker = '*** START OF THIS PROJECT GUTENBERG EBOOK';
    const endMarker = '*** END OF THIS PROJECT GUTENBERG EBOOK';

    const startIndex = rawText.indexOf(startMarker);
    const endIndex = rawText.indexOf(endMarker);

    let cleanedText = rawText;
    if (startIndex !== -1 && endIndex !== -1) {
      cleanedText = rawText.substring(startIndex + startMarker.length, endIndex).trim();
    }

    console.log(`[Book Content] Successfully fetched and cleaned content for book ID: ${id}`);
    res.type('text/plain').send(cleanedText);
  } catch (err) {
    console.error(`[Book Content] Error fetching book content for ID ${id}:`, err);
    res.status(500).json({ error: 'Error fetching book content' });
  }
});

// 4. Reviews for a book
router.get('/reviews', async (req, res) => {
  const bookId = req.query.bookId;
  if (!bookId) return res.status(400).json({ error: 'Missing bookId query parameter' });

  try {
    const reviews = await prisma.review.findMany({
      where: { bookId: Number(bookId) },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews.map(({ id, user, ...review }) => ({
      ...review,
      _id: id,
      userId: { username: user.username },
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// 5. Submit a review
router.post('/reviews', async (req, res) => {
  const { bookId, userId, rating, comment } = req.body;

  if (!bookId || !userId || !rating || !comment) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const review = await prisma.review.create({
      data: {
        bookId: Number(bookId),
        userId,
        rating: Number(rating),
        comment,
      },
    });
    res.status(201).json({ ...review, _id: review.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save review' });
  }
});

export default router;
