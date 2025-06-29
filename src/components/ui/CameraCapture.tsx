import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, RotateCcw, Download, Upload } from 'lucide-react';
import ModernButton from './ModernButton';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onClose,
  isOpen
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const retake = () => {
    setCapturedImage(null);
  };

  const confirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
      onClose();
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Camera className="w-6 h-6 text-blue-600" />
              <span>Capture Photo</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Camera/Preview Area */}
          <div className="relative bg-black">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-80 object-cover"
              />
            ) : (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-80 object-cover"
              />
            )}

            {/* Camera Controls Overlay */}
            {!capturedImage && (
              <div className="absolute top-4 right-4">
                <button
                  onClick={switchCamera}
                  className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 bg-gray-50">
            {capturedImage ? (
              <div className="flex items-center justify-center space-x-4">
                <ModernButton
                  variant="secondary"
                  onClick={retake}
                  icon={RotateCcw}
                >
                  Retake
                </ModernButton>
                <ModernButton
                  variant="primary"
                  onClick={confirm}
                  icon={Upload}
                >
                  Use Photo
                </ModernButton>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <button
                  onClick={capture}
                  className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                >
                  <Camera className="w-8 h-8" />
                </button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="p-4 bg-blue-50 border-t border-blue-200">
            <p className="text-sm text-blue-800 text-center">
              {capturedImage 
                ? 'Review your photo and choose to retake or use it.'
                : 'Position your wound or incision site in the camera view and tap the capture button.'
              }
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CameraCapture;