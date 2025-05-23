import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/ai-token', async (req, res) => {
  try {
    // 환경변수에서 클라이언트 정보 읽기
    const { AI_CORE_CLIENT_ID, AI_CORE_CLIENT_SECRET, AI_CORE_TOKEN_URL } = process.env;
    console.log('AI_CORE_CLIENT_ID:', AI_CORE_CLIENT_ID);
    console.log('AI_CORE_CLIENT_SECRET:', AI_CORE_CLIENT_SECRET);
    console.log('AI_CORE_TOKEN_URL:', AI_CORE_TOKEN_URL);

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', AI_CORE_CLIENT_ID);
    params.append('client_secret', AI_CORE_CLIENT_SECRET);

    const response = await axios.post(AI_CORE_TOKEN_URL, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 