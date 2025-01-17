import { TextReferencePointer, Selection } from '../Relationship';

describe('SelectionRectangle', () => {
  it.each([
    { top: -1, left: 0, height: 1, width: 1, comment: 'negative top' },
    { top: 0, left: -1, height: 1, width: 1, comment: 'negative left' },
    { top: 0, left: 0, height: 0, width: 1, comment: 'no height' },
    { top: 0, left: 0, height: 1, width: 0, comment: 'no width' },
    { top: -1, left: -1, height: -1, width: -1, comment: 'several problems' },
  ])('should fail if the rectangle has $comment', async ({ top, left, height, width }) => {
    try {
      const selection = new Selection(1, top, left, height, width);
      fail(`${selection} should fail if properties are invalid`);
    } catch (e) {
      await expect(e.message).toMatch(/top|left|height|width/);
    }
  });

  it('should fail the rectangle is in a non-positive page', async () => {
    try {
      const selection = new Selection(0, 1, 1, 1, 1);
      fail(`${selection} should fail if the page is non-positive`);
    } catch (e) {
      await expect(e.message).toMatch(/page/i);
    }
  });
});

describe('Pointer', () => {
  describe('TextReferencePointer', () => {
    it('should fail if no selection rectangles are provided', async () => {
      try {
        const textReference = new TextReferencePointer('entity1', 'file1', [], 'text');
        fail(`${textReference} should fail if instantiated without rectangles`);
      } catch (e) {
        await expect(e.message).toMatch(/selection/);
      }
    });
  });
});
