// /api/blob/route.js
import { put } from '@vercel/blob';


export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // 获取文件内容和文件名
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      const filename = req.headers['x-vercel-filename'] || `file-${Date.now()}`;
      
      // 上传到 Vercel Blob
      const blob = await put(filename, buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      
      return res.status(200).json(blob);
    } catch (error) {
      console.error('上传错误:', error);
      return res.status(500).json({ error: '文件上传失败' });
    }
  }
  
  // GET 请求处理
  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: "Blob API is working!",
      usage: "Send POST request with file content to upload"
    });
  }
  
  // 其他请求方法
  return res.status(405).json({ error: "Method not allowed" });
}