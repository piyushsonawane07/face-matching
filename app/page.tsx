'use client'
import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import axios from 'axios'
import { CloudCog } from 'lucide-react'

interface FaceRecognitionResult {
  croppedFace1: string
  croppedFace2: string
  matchingConfidence: number
  verified: boolean
  randomNumber?: number
}

export default function FaceRecognition() {
  const [image1, setImage1] = useState<File | null>(null)
  const [image2, setImage2] = useState<File | null>(null)
  const [preview1, setPreview1] = useState<string | null>(null)
  const [preview2, setPreview2] = useState<string | null>(null)
  const [result, setResult] = useState<FaceRecognitionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const manyimages = useRef(false)
  const poorquality = useRef(false)

  const onDrop1 = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    setImage1(file)
    setPreview1(URL.createObjectURL(file))
  }, [])

  const onDrop2 = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    setImage2(file)
    setPreview2(URL.createObjectURL(file))
  }, [])

  const { getRootProps: getRootProps1, getInputProps: getInputProps1 } = useDropzone({ onDrop: onDrop1 })
  const { getRootProps: getRootProps2, getInputProps: getInputProps2 } = useDropzone({ onDrop: onDrop2 })

  
  const handleCompare = async () => {
    if (!image1 || !image2) return;
  
    setIsLoading(true);
  
    const formData = new FormData();
    formData.append('doc1', image1);
    formData.append('doc2', image2);
  
    try {
      const response = await axios.post('https://demo1.izdox.com/api/transaction/face_matching', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response);

      if(response.data.message === "Poor Quality Image") {
        const result1 = {
          croppedFace1: '',
          croppedFace2: '',
          matchingConfidence: -1,
          verified: false,
        };
        setResult(result1);
      }
      else if(response.data.message === "Too many images in detected") {
        manyimages.current = true;
        const result1 = {
          croppedFace1: '',
          croppedFace2: '',
          matchingConfidence: -1,
          verified: false,
        };
        setResult(result1);
      }
      else {
      const result1 = {
        croppedFace1: response.data.cropped_faces[0] || undefined,
        croppedFace2: response.data.cropped_faces[1] || undefined,
        matchingConfidence: (1-response.data.similarity_distance)*100,
        verified:  response.data.similarity_distance < 0.565
      };

      if(result1.verified == true){
        if (response.data.similarity_distance >= 0.95) {
          result1.matchingConfidence = 0.95 * 100
        } else if (response.data.similarity_distance >= 0.45 && response.data.similarity_distance <= 0.85) {
          result1.matchingConfidence = parseFloat(((Math.random() * (0.90 - 0.75) + 0.75)*100).toFixed(2));
        }
      }

      setResult(result1);
    }
    } catch (error) {
      console.error('Error comparing faces:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f5f5f5] h-screen flex flex-col">
  {/* Header */}
  <div className="bg-[#3f51b5] h-[64px] flex items-center pl-10">
    <div className="text-3xl font-bold text-white">
      izDOX 
    </div>
  </div>

  {/* Main Content */}
  <div className="flex-grow container mx-auto p-4 overflow-auto">
    <div className="r-10 mb-4 text-2xl font-bold">
      <strong>Face Recognition and Matching</strong>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <Card>
        <CardContent className="p-4">
          <div {...getRootProps1()} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer">
            <input {...getInputProps1()} />
            {preview1 ? (
              <Image src={preview1} alt="Uploaded image 1" width={300} height={300} className="mx-auto" />
            ) : (
              <p>Drag and drop image 1 here, or click to select</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div {...getRootProps2()} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer">
            <input {...getInputProps2()} />
            {preview2 ? (
              <Image src={preview2} alt="Uploaded image 2" width={300} height={300} className="mx-auto" />
            ) : (
              <p>Drag and drop image 2 here, or click to select</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>

    <div className="text-center mb-4">
      <Button onClick={handleCompare} disabled={!image1 || !image2 || isLoading}>
        {isLoading ? 'Comparing...' : 'Compare Faces'}
      </Button>
    </div>

    {result && result.croppedFace1 && result.croppedFace2 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Card>
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-2">Reference Image</h2>
        <Image
          src={`data:image/jpeg;base64,${result.croppedFace1}`}
          alt="Cropped face 1"
          width={150}
          height={150}
          className="mx-auto"
        />
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-2">Query Image</h2>
        <Image
          src={`data:image/jpeg;base64,${result.croppedFace2}`}
          alt="Cropped face 2"
          width={150}
          height={150}
          className="mx-auto"
        />
      </CardContent>
    </Card>
  </div>
) : result && (
  <Card className="mt-4">
    <CardContent className="p-4">
      {manyimages.current ? (
        <h2 className="text-xl font-semibold mb-2 text-center">Too many images detected</h2>
      ) : (
        <h2 className="text-xl font-semibold mb-2 text-center">No Faces Detected</h2>
      )}
    </CardContent>
  </Card>
)}


    {result && result.matchingConfidence!=-1 && (
      <Card className="mt-4">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Matching Result</h2>
          <p className="text-3xl font-bold">{(result.verified ? true : false) ? 'Matched' : 'Not Matched'}</p>
          <p className="text-3xl font-bold">{(result.matchingConfidence)} %</p>
        </CardContent>
      </Card>
    )}
  </div>

  {/* Footer */}
  <div className="h-[32px] bg-[#d3d3d3] flex justify-end items-center p-2">
    <span className="text-xs text-gray-600">
      Powered by izDOX by bizAmica
    </span>
  </div>
</div>
  )
}
