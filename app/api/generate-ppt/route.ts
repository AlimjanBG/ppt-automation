import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
export const dynamic = 'force-dynamic';


const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
// 更新为 DeepSeek 的最新 API 地址
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

const transporter = nodemailer.createTransport({
  service: 'qq',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const { topic, details, email } = await req.json();

    // 构建发送给 DeepSeek 的提示词，引导其生成我们想要的 PPT 大纲格式
    const prompt = `请为“${topic}”这个主题，生成一份用于商业汇报的PPT大纲。
要求：
- 共5页幻灯片
- 用“---”分隔每一页
- 每页第一行是标题（以##开头）
- 每页至少3个要点（以-开头）
额外要求：${details || '无'}`;

    // 调用 DeepSeek API 生成内容
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        // 更新为 DeepSeek 官方最新的模型名称
        model: 'deepseek-v4-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    // 处理 DeepSeek API 返回的错误
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API 错误:', response.status, errorText);
      return NextResponse.json(
        { success: false, message: `DeepSeek API 调用失败: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('DeepSeek 返回内容为空');
    }

    // 发送邮件，将生成的大纲发送给用户
    await transporter.sendMail({
      from: `"AI PPT助手" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `您定制的PPT「${topic}」已生成`,
      html: `<p>您好，您定制的PPT内容如下（您可复制到Word或PPT中排版）：</p>
             <pre style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px;">${content}</pre>
             <p>如需真实.pptx文件，后续版本将支持。</p>`,
    });

    return NextResponse.json({ success: true, message: 'PPT大纲已发送到您的邮箱' });
  } catch (error: any) {
    console.error('生成PPT失败:', error);
    return NextResponse.json(
      { success: false, message: error.message || '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}