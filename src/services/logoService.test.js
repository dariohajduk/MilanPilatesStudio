import { logoService } from './logoService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
}));

describe('logoService Tests', () => {
  afterEach(() => {
    jest.clearAllMocks(); // לנקות את המוקים בין הבדיקות
  });

  describe('uploadLogo', () => {
    test('should upload a logo and save the URL in Firestore', async () => {
      const file = new Blob(['logo content'], { type: 'image/png' });

      // Mock הפונקציות
      ref.mockReturnValue({ path: 'logo/studio-logo' });
      uploadBytes.mockResolvedValueOnce();
      getDownloadURL.mockResolvedValueOnce('https://example.com/studio-logo.png');
      setDoc.mockResolvedValueOnce();

      const url = await logoService.uploadLogo(file);

      expect(ref).toHaveBeenCalledWith(expect.anything(), 'logo/studio-logo');
      expect(uploadBytes).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'logo/studio-logo' }),
        file
      );
      expect(getDownloadURL).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'logo/studio-logo' })
      );
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        {
          url: 'https://example.com/studio-logo.png',
          updatedAt: expect.any(String),
        }
      );
      expect(url).toBe('https://example.com/studio-logo.png');
    });

    test('should throw an error if upload fails', async () => {
      const file = new Blob(['logo content'], { type: 'image/png' });

      uploadBytes.mockRejectedValueOnce(new Error('Upload failed'));

      await expect(logoService.uploadLogo(file)).rejects.toThrow('Upload failed');
    });
  });

  describe('getCurrentLogo', () => {
    test('should return the current logo URL', async () => {
      ref.mockReturnValue({ path: 'logo/studio-logo' });
      getDownloadURL.mockResolvedValueOnce('https://example.com/studio-logo.png');

      const url = await logoService.getCurrentLogo();

      expect(ref).toHaveBeenCalledWith(expect.anything(), 'logo/studio-logo');
      expect(getDownloadURL).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'logo/studio-logo' })
      );
      expect(url).toBe('https://example.com/studio-logo.png');
    });

    test('should return null if an error occurs', async () => {
      ref.mockReturnValue({ path: 'logo/studio-logo' });
      getDownloadURL.mockRejectedValueOnce(new Error('Failed to fetch URL'));

      const url = await logoService.getCurrentLogo();

      expect(ref).toHaveBeenCalledWith(expect.anything(), 'logo/studio-logo');
      expect(url).toBeNull();
    });
  });
});
