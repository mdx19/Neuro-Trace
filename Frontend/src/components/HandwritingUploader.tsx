import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ApiUtils } from '../services/api';
import toast from 'react-hot-toast';

interface HandwritingUploaderProps {
  onFileUploaded: (file: File) => void;
  onSkip: () => void;
  onBack: () => void;
}

const HandwritingUploader: React.FC<HandwritingUploaderProps> = ({ 
  onFileUploaded, 
  onSkip, 
  onBack 
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate the file
    const validation = ApiUtils.validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setUploadedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    toast.success('Handwriting sample uploaded successfully');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.bmp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = () => {
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleContinue = () => {
    if (uploadedFile) {
      onFileUploaded(uploadedFile);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Handwriting Sample
          </h2>
          <p className="text-gray-600">
            Upload a handwriting sample to enhance the accuracy of the assessment. 
            This step is optional but recommended for better results.
          </p>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            For best results:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use a clear, well-lit photo or scan</li>
            <li>• Include multiple sentences or paragraphs</li>
            <li>• Ensure text is legible and not blurry</li>
            <li>• Use a plain background (white paper preferred)</li>
            <li>• Include both words and sentences</li>
          </ul>
        </div>

        {/* Upload Area */}
        {!uploadedFile ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-medical-500 bg-medical-50'
                : 'border-gray-300 hover:border-medical-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            
            <div>
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-10v12m-14 4h20v10a2 2 0 01-2 2H6a2 2 0 01-2-2V22z"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Drop your handwriting sample here' : 'Upload handwriting sample'}
              </p>
              
              <p className="text-gray-600 mb-4">
                Drag and drop your image here, or click to browse
              </p>
              
              <div className="text-sm text-gray-500">
                <p>Supported formats: PNG, JPG, JPEG, BMP</p>
                <p>Maximum file size: 10MB</p>
              </div>
            </div>
          </div>
        ) : (
          /* Preview Area */
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Uploaded Sample</h3>
                <button
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
              
              {previewUrl && (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Handwriting sample preview"
                    className="w-full max-h-64 object-contain border border-gray-200 rounded"
                  />
                  <div className="text-sm text-gray-600">
                    <p><strong>File:</strong> {uploadedFile.name}</p>
                    <p><strong>Size:</strong> {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p><strong>Type:</strong> {uploadedFile.type}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Re-upload option */}
            <div
              {...getRootProps()}
              className="border border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-medical-400 hover:bg-gray-50"
            >
              <input {...getInputProps()} />
              <p className="text-sm text-gray-600">
                Click here to upload a different image
              </p>
            </div>
          </div>
        )}

        {/* Sample Examples */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Sample Types That Work Well:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-medium">Written Text</p>
              <p>Letters, words, sentences</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <p className="font-medium">Signatures</p>
              <p>Multiple signature samples</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <p className="font-medium">Drawings</p>
              <p>Simple shapes, spirals</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-between">
          <button
            onClick={onBack}
            className="btn-secondary px-6 py-3"
          >
            ← Back to Form
          </button>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onSkip}
              className="btn-secondary px-6 py-3"
            >
              Skip This Step
            </button>
            
            <button
              onClick={handleContinue}
              disabled={!uploadedFile}
              className={`px-6 py-3 ${
                uploadedFile 
                  ? 'btn-medical' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue with Sample →
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Handwriting analysis can provide additional insights into cognitive health. 
            You can skip this step if you prefer to use only clinical data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HandwritingUploader;