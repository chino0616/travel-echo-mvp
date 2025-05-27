import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { LocalStorageHandler } from '@/utils/localStorageHandler';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允許 POST 請求' });
  }

  try {
    const form = formidable({});
    const storage = new LocalStorageHandler();

    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ message: '未找到上傳的文件' });
    }

    // 讀取上傳的文件
    const fileBuffer = await require('fs/promises').readFile(file.filepath);
    
    // 保存文件並獲取URL
    const fileUrl = await storage.saveUploadedFile(fileBuffer, file.originalFilename || 'upload.jpg');

    return res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error('文件上傳錯誤:', error);
    return res.status(500).json({ message: '文件上傳失敗' });
  }
} 