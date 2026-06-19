import axios from "axios";

import FormData from "form-data";

export const uploadVoice =
  async (req, res) => {

    try {

      const botToken =
        process.env
          .TELEGRAM_BOT_TOKEN;

      const chatId =
        process.env
          .TELEGRAM_CHAT_ID;

      const formData =
        new FormData();

      formData.append(
        "chat_id",
        chatId
      );

      formData.append(
        "voice",

        req.file.buffer,

        "voice.webm"
      );




      // SEND TO TELEGRAM
      const telegramRes =
        await axios.post(

          `https://api.telegram.org/bot${botToken}/sendVoice`,

          formData,

          {
            headers:
              formData.getHeaders(),
          }

        );




      const fileId =

        telegramRes.data
          .result.voice.file_id;




      // GET FILE
      const fileRes =
        await axios.get(

          `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`

        );




      const filePath =

        fileRes.data
          .result.file_path;




      const fileUrl =

        `https://api.telegram.org/file/bot${botToken}/${filePath}`;




      res.json({

        url:fileUrl,

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        message:
          error.message,

      });

    }

  };