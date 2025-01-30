const { Blob } = require('buffer'); // ייבוא Blob מ-buffer
import { logoService } from '../logoService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';

// Mock Firebase methods
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => 'mockStorage'),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => 'mockDb'),
  doc: jest.fn(),
  setDoc: jest.fn(),
}));

describe('logoService Tests', () => {
  let originalConsoleError;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn(); // עוקף את console.error
  });

  afterEach(() => {
    console.error = originalConsoleError; // משחזר את הפונקציה המקורית
    jest.clearAllMocks();
  });

  describe('uploadLogo', () => {
    test('should upload logo and save URL in Firestore', async () => {
      const mockFile = new Blob(['logo content'], { type: 'image/png' });
      const mockUrl = 'https://mockstorage.com/logo/studio-logo';

      // Mock implementations
      ref.mockReturnValue('mockRef');
      uploadBytes.mockResolvedValueOnce(); // Simulate successful upload
      getDownloadURL.mockResolvedValueOnce(mockUrl); // Simulate URL retrieval
      setDoc.mockResolvedValueOnce(); // Simulate Firestore write

      // Call the service
      const result = await logoService.uploadLogo(mockFile);

      // Assert the returned URL
      expect(result).toBe(mockUrl);

      // Verify Firebase calls
      expect(ref).toHaveBeenCalledWith('mockStorage', 'logo/studio-logo');
      expect(uploadBytes).toHaveBeenCalledWith('mockRef', mockFile);
      expect(getDownloadURL).toHaveBeenCalledWith('mockRef');
      expect(setDoc).toHaveBeenCalledWith(
        doc('mockDb', 'settings', 'logo'),
        { url: mockUrl, updatedAt: expect.any(String) }
      );
    });

    test('should throw an error if upload fails', async () => {
      const mockFile = new Blob(['logo content'], { type: 'image/png' });
      const mockError = new Error('Upload failed');

      // Mock uploadBytes to throw an error
      uploadBytes.mockRejectedValueOnce(mockError);

      // Call the service and expect it to throw
      await expect(logoService.uploadLogo(mockFile)).rejects.toThrow(mockError);

      // Ensure only the upload was attempted
      expect(uploadBytes).toHaveBeenCalledWith(expect.anything(), mockFile);
      expect(getDownloadURL).not.toHaveBeenCalled();
      expect(setDoc).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentLogo', () => {
    test('should return the current logo URL', async () => {
      const mockUrl = 'https://mockstorage.com/logo/studio-logo';

      // Mock getDownloadURL
      ref.mockReturnValue('mockRef');
      getDownloadURL.mockResolvedValueOnce(mockUrl);

      // Call the service
      const result = await logoService.getCurrentLogo();

      // Assert the returned URL
      expect(result).toBe(mockUrl);

      // Verify Firebase calls
      expect(ref).toHaveBeenCalledWith('mockStorage', 'logo/studio-logo');
      expect(getDownloadURL).toHaveBeenCalledWith('mockRef');
    });

    test('should return null if no logo is found', async () => {
      // Mock getDownloadURL to throw an error
      ref.mockReturnValue('mockRef');
      getDownloadURL.mockRejectedValueOnce(new Error('No logo found'));

      // Call the service
      const result = await logoService.getCurrentLogo();

      // Assert the result is null
      expect(result).toBeNull();

      // Verify Firebase calls
      expect(ref).toHaveBeenCalledWith('mockStorage', 'logo/studio-logo');
      expect(getDownloadURL).toHaveBeenCalledWith('mockRef');
    });
  });
});
