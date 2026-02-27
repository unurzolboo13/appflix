import { Movie } from "../types";

const BOT_TOKEN = '8352707182:AAFOUmJl6Db1jkaXZAprE3xeBPwZTRGvbFs';
const CHAT_ID = '-1003746679729';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Updated to the official Mini App link
const APP_LINK = 'https://t.me/flex_ex_bot/okey';

// Helper to convert Base64 string to Blob
function base64ToBlob(base64: string): Blob {
    const arr = base64.split(',');
    const match = arr[0].match(/:(.*?);/);
    const mime = match ? match[1] : 'image/jpeg'; // Default to jpeg if unknown
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

export const telegramService = {
  /**
   * Generates the default caption for a movie in Markdown format.
   * Useful for showing a preview before sending.
   */
  generateCaption(movie: Movie): string {
    const genreText = Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre;

    return `
*${movie.title}*

🗓 Year: ${movie.year}
⭐ Rating: ${movie.rating}
🎭 Genre: ${genreText}

👇 *Шууд үзэх:*
${APP_LINK}
    `.trim();
  },

  /**
   * Formats the caption and sends the movie to the Telegram Channel.
   * Checks if the media is a video or image.
   * Handles both HTTP URLs (JSON) and Base64 Data URIs (FormData).
   */
  async sendMovieToChannel(movie: Movie, customCaption?: string, customMediaUrl?: string): Promise<void> {
    // Use custom caption if provided, otherwise generate default
    const caption = customCaption || telegramService.generateCaption(movie);
    
    // Use custom URL if provided, otherwise fallback to thumbnail then backdrop
    const mediaUrl = customMediaUrl || movie.thumbnailUrl || movie.backdropUrl;

    if (!mediaUrl) {
        throw new Error("No media URL found (Image or Video) to send.");
    }

    const replyMarkupObj = {
        inline_keyboard: [
            [
            { text: "▶️ Шууд үзэх", url: APP_LINK }
            ]
        ]
    };

    // Check if it is a Local File (Base64)
    const isBase64 = mediaUrl.startsWith('data:');

    try {
        let response;

        if (isBase64) {
            // --- METHOD A: SEND FILE (FormData) ---
            const blob = base64ToBlob(mediaUrl);
            
            // Determine type from Blob MIME type
            const isVideo = blob.type.startsWith('video');
            const method = isVideo ? 'sendVideo' : 'sendPhoto';
            const fieldName = isVideo ? 'video' : 'photo';
            const filename = isVideo ? 'video.mp4' : 'image.jpg';

            const formData = new FormData();
            formData.append('chat_id', CHAT_ID);
            formData.append(fieldName, blob, filename);
            formData.append('caption', caption);
            formData.append('parse_mode', 'Markdown');
            // For FormData, complex types like reply_markup must be JSON stringified
            formData.append('reply_markup', JSON.stringify(replyMarkupObj));

            response = await fetch(`${TELEGRAM_API}/${method}`, {
                method: 'POST',
                body: formData
            });

        } else {
            // --- METHOD B: SEND URL (JSON) ---
            
            // Determine type from URL extension
            const isVideo = mediaUrl.match(/\.(mp4|mov|avi|mkv|webm)$/i);
            const method = isVideo ? 'sendVideo' : 'sendPhoto';
            const mediaKey = isVideo ? 'video' : 'photo';

            response = await fetch(`${TELEGRAM_API}/${method}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    [mediaKey]: mediaUrl,
                    caption: caption,
                    parse_mode: 'Markdown',
                    reply_markup: replyMarkupObj
                })
            });
        }

        const data = await response.json();
        
        if (!data.ok) {
            console.warn(`Telegram API Error:`, data);
            throw new Error(data.description || "Unknown Telegram Error");
        }

    } catch (error: any) {
        console.error("Telegram API Exception:", error);
        // Throw a cleaner error for the UI to catch
        throw error;
    }
  }
};