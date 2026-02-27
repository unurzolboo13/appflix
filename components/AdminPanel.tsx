import React, { useState, useRef } from 'react';
import { Movie } from '../types';
import { Trash2, Plus, Image as ImageIcon, Film, Edit, Save, RotateCcw, Upload, Link as LinkIcon, Loader2, Database, Send, X, Video } from 'lucide-react';
import { flixService } from '../services/flixService';
import { telegramService } from '../services/telegramService';

interface AdminPanelProps {
  movies: Movie[];
  onAddMovie: (movie: Movie) => Promise<void>;
  onUpdateMovie: (movie: Movie) => Promise<void>;
  onDeleteMovie: (id: string) => Promise<void>;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ movies, onAddMovie, onUpdateMovie, onDeleteMovie, onClose }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingData, setIsUploadingData] = useState(false);
  const [sendingTelegramId, setSendingTelegramId] = useState<string | null>(null);
  
  // State for Telegram Preview Modal: Now includes mediaUrl
  const [telegramPreview, setTelegramPreview] = useState<{ movie: Movie, caption: string, mediaUrl: string } | null>(null);
  
  // State to toggle between URL input and File Upload
  const [useFileUpload, setUseFileUpload] = useState({ thumb: true, backdrop: true });

  const fileInputThumbRef = useRef<HTMLInputElement>(null);
  const fileInputBackdropRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vimeoId: '',
    thumbnailUrl: '',
    backdropUrl: '',
    genre: '',
    year: new Date().getFullYear(),
    duration: '',
    rating: '98% Match'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle File Upload and convert to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'thumbnailUrl' | 'backdropUrl') => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, [field]: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleEditClick = (movie: Movie) => {
    setEditingId(movie.id);
    setFormData({
      title: movie.title,
      description: movie.description,
      vimeoId: movie.vimeoId,
      thumbnailUrl: movie.thumbnailUrl,
      backdropUrl: movie.backdropUrl,
      genre: movie.genre.join(', '),
      year: movie.year,
      duration: movie.duration,
      rating: movie.rating
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      vimeoId: '',
      thumbnailUrl: '',
      backdropUrl: '',
      genre: '',
      year: new Date().getFullYear(),
      duration: '',
      rating: '98% Match'
    });
    if (fileInputThumbRef.current) fileInputThumbRef.current.value = '';
    if (fileInputBackdropRef.current) fileInputBackdropRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.vimeoId) return;

    setIsSubmitting(true);
    
    const movieData: Movie = {
      id: editingId ? editingId : Date.now().toString(),
      title: formData.title,
      description: formData.description,
      vimeoId: formData.vimeoId,
      thumbnailUrl: formData.thumbnailUrl || 'https://via.placeholder.com/400x600',
      backdropUrl: formData.backdropUrl || 'https://via.placeholder.com/800x450',
      genre: formData.genre.split(',').map(g => g.trim()),
      year: Number(formData.year),
      duration: formData.duration,
      rating: formData.rating
    };

    try {
        if (editingId) {
            await onUpdateMovie(movieData);
            alert('Кино амжилттай шинэчлэгдлээ!');
            handleCancelEdit();
        } else {
            await onAddMovie(movieData);
            // Updated alert message since auto-post is disabled
            alert('Кино амжилттай нэмэгдлээ! (Telegram руу илгээх бол "Илгээх" товчийг дарна уу)');
            resetForm();
        }
    } catch (e: any) {
        console.error(e);
        alert('Алдаа гарлаа: ' + (e.message || 'Хадгалж чадсангүй.'));
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleManualUpload = async () => {
    if (!window.confirm("Энэ нь 'flix' цуглуулга руу анхны өгөгдлийг дахин хуулах болно. Үргэлжлүүлэх үү?")) return;
    
    setIsUploadingData(true);
    try {
      await flixService.uploadMovies();
      alert("Өгөгдөл амжилттай илгээгдлээ! Хуудсыг дахин ачаална уу.");
      window.location.reload();
    } catch (e: any) {
      alert("Алдаа: " + e.message);
    } finally {
      setIsUploadingData(false);
    }
  };

  // 1. Trigger the Preview Modal
  const handleOpenTelegramPreview = (movie: Movie) => {
    const caption = telegramService.generateCaption(movie);
    // Prefer thumbnail, fallback to backdrop
    const mediaUrl = movie.thumbnailUrl || movie.backdropUrl;
    setTelegramPreview({ movie, caption, mediaUrl });
  };

  // 2. Confirm and Send with Edited Caption and Media
  const handleConfirmSendToTelegram = async () => {
    if (!telegramPreview) return;
    
    const { movie, caption, mediaUrl } = telegramPreview;
    setSendingTelegramId(movie.id);

    try {
      await telegramService.sendMovieToChannel(movie, caption, mediaUrl);
      alert("Telegram руу амжилттай илгээгдлээ!");
      setTelegramPreview(null); // Close modal on success
    } catch (e: any) {
      console.error(e);
      // Custom user-friendly error message
      alert("Зургийн линк буруу байна эсвэл файл хэтэрхий том байна.");
    } finally {
      setSendingTelegramId(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-4 md:p-8 pt-20">
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-700 pb-4 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-red-600">Админ Самбар</h1>
              <p className="text-xs text-gray-500 mt-1">Нийт кино: {movies.length}</p>
            </div>
            <div className="flex gap-3">
              <button 
                  onClick={handleManualUpload}
                  disabled={isUploadingData}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition flex items-center gap-2 text-sm"
              >
                 {isUploadingData ? <Loader2 className="w-4 h-4 animate-spin"/> : <Database className="w-4 h-4" />}
                 Өгөгдөл Сэргээх
              </button>
              <button 
                  onClick={onClose}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition"
              >
                  Гарах
              </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-1 bg-neutral-800 p-6 rounded-lg h-fit sticky top-24 border border-neutral-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-semibold flex items-center gap-2 ${editingId ? 'text-yellow-500' : 'text-green-500'}`}>
                      {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />} 
                      {editingId ? 'Кино засварлах' : 'Шинэ кино нэмэх'}
                  </h2>
                  {editingId && (
                    <button onClick={handleCancelEdit} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> Болих
                    </button>
                  )}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Киноны нэр</label>
                        <input 
                            name="title" 
                            value={formData.title} 
                            onChange={handleChange} 
                            placeholder="Жишээ: The Matrix" 
                            className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm focus:border-red-600 outline-none"
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Тайлбар</label>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            placeholder="Киноны тухай товч..." 
                            className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm focus:border-red-600 outline-none h-24"
                            required 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Vimeo ID</label>
                            <input 
                                name="vimeoId" 
                                value={formData.vimeoId} 
                                onChange={handleChange} 
                                placeholder="12345678" 
                                className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm focus:border-red-600 outline-none"
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Он</label>
                            <input 
                                type="number" 
                                name="year" 
                                value={formData.year} 
                                onChange={handleChange} 
                                className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm focus:border-red-600 outline-none" 
                            />
                        </div>
                    </div>

                    {/* Thumbnail Image Input */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs text-gray-400">Жижиг зураг (Poster)</label>
                            <button 
                                type="button"
                                onClick={() => setUseFileUpload(prev => ({...prev, thumb: !prev.thumb}))}
                                className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                            >
                                {useFileUpload.thumb ? <LinkIcon className="w-3 h-3" /> : <Upload className="w-3 h-3" />}
                                {useFileUpload.thumb ? 'Линкээр оруулах' : 'Файл оруулах'}
                            </button>
                        </div>
                        
                        <div className="flex items-start gap-2">
                             <div className="bg-neutral-900 p-2 rounded border border-neutral-700 h-10 w-10 flex items-center justify-center overflow-hidden">
                                {formData.thumbnailUrl ? (
                                    <img src={formData.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-4 h-4 text-gray-500" />
                                )}
                             </div>
                             
                             {useFileUpload.thumb ? (
                                 <input 
                                    type="file" 
                                    accept="image/*"
                                    ref={fileInputThumbRef}
                                    onChange={(e) => handleFileChange(e, 'thumbnailUrl')}
                                    className="w-full bg-neutral-900 text-xs p-2 rounded border border-neutral-700 focus:border-red-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                                 />
                             ) : (
                                <input 
                                    name="thumbnailUrl" 
                                    value={formData.thumbnailUrl} 
                                    onChange={handleChange} 
                                    placeholder="https://..." 
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm focus:border-red-600 outline-none" 
                                />
                             )}
                        </div>
                    </div>

                    {/* Backdrop Image Input */}
                    <div>
                         <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs text-gray-400">Том зураг (Background)</label>
                            <button 
                                type="button"
                                onClick={() => setUseFileUpload(prev => ({...prev, backdrop: !prev.backdrop}))}
                                className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                            >
                                {useFileUpload.backdrop ? <LinkIcon className="w-3 h-3" /> : <Upload className="w-3 h-3" />}
                                {useFileUpload.backdrop ? 'Линкээр оруулах' : 'Файл оруулах'}
                            </button>
                        </div>
                        <div className="flex items-start gap-2">
                             <div className="bg-neutral-900 p-2 rounded border border-neutral-700 h-10 w-16 flex items-center justify-center overflow-hidden">
                                 {formData.backdropUrl ? (
                                    <img src={formData.backdropUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Film className="w-4 h-4 text-gray-500" />
                                )}
                             </div>
                             {useFileUpload.backdrop ? (
                                 <input 
                                    type="file" 
                                    accept="image/*"
                                    ref={fileInputBackdropRef}
                                    onChange={(e) => handleFileChange(e, 'backdropUrl')}
                                    className="w-full bg-neutral-900 text-xs p-2 rounded border border-neutral-700 focus:border-red-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                                 />
                             ) : (
                                <input 
                                    name="backdropUrl" 
                                    value={formData.backdropUrl} 
                                    onChange={handleChange} 
                                    placeholder="https://..." 
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm focus:border-red-600 outline-none" 
                                />
                             )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block text-xs text-gray-400 mb-1">Хугацаа</label>
                            <input 
                                name="duration" 
                                value={formData.duration} 
                                onChange={handleChange} 
                                placeholder="1h 30m" 
                                className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm focus:border-red-600 outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Төрөл (таслалаар)</label>
                            <input 
                                name="genre" 
                                value={formData.genre} 
                                onChange={handleChange} 
                                placeholder="Action, Drama" 
                                className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm focus:border-red-600 outline-none" 
                            />
                        </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className={`w-full font-bold py-2 rounded transition mt-4 flex items-center justify-center gap-2 ${editingId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? (
                             <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {editingId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                {editingId ? 'Шинэчлэх (Update)' : 'Нэмэх (Add)'}
                            </>
                        )}
                    </button>
                    
                    {editingId && (
                      <button 
                        type="button" 
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded transition"
                      >
                        Болих
                      </button>
                    )}
                </form>
            </div>

            {/* List Section - REFACTORED TO GRID WITH TITLE UNDER POSTER */}
            <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Байгаа кинонууд ({movies.length})</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {movies.map(movie => (
                        <div key={movie.id} className={`bg-neutral-800 flex flex-col rounded-lg overflow-hidden group border transition ${editingId === movie.id ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'border-transparent hover:border-gray-600'}`}>
                            {/* Poster Image */}
                            <div className="relative aspect-[2/3] w-full">
                                <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                            </div>

                            {/* Content Under Image */}
                            <div className="p-3 flex flex-col flex-1">
                                <h3 className="font-bold text-sm leading-tight line-clamp-2 mb-1 min-h-[2.5em]">{movie.title}</h3>
                                <p className="text-[10px] text-gray-400 mb-3 line-clamp-1">{movie.year} • {movie.rating}</p>
                                
                                <div className="mt-auto grid grid-cols-3 gap-1">
                                    <button
                                        onClick={() => handleOpenTelegramPreview(movie)}
                                        disabled={sendingTelegramId === movie.id}
                                        className="bg-blue-600/10 hover:bg-blue-600/30 text-blue-500 flex items-center justify-center rounded py-1.5 transition"
                                        title="Telegram руу илгээх"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleEditClick(movie)}
                                        className="bg-yellow-600/10 hover:bg-yellow-600/30 text-yellow-500 flex items-center justify-center rounded py-1.5 transition"
                                        title="Засах"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            if(window.confirm(`Та "${movie.title}" киног устгахдаа итгэлтэй байна уу?`)) {
                                                try {
                                                    await onDeleteMovie(movie.id);
                                                } catch (e: any) {
                                                     alert('Алдаа: ' + (e.message || 'Устгаж чадсангүй'));
                                                }
                                            }
                                        }}
                                        className="bg-red-600/10 hover:bg-red-600/30 text-red-500 flex items-center justify-center rounded py-1.5 transition"
                                        title="Устгах"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Telegram Preview Modal */}
        {telegramPreview && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
                <div className="bg-neutral-800 rounded-lg max-w-lg w-full p-6 relative shadow-2xl border border-gray-700 animate-fade-in-up max-h-[90vh] overflow-y-auto">
                     <button 
                        onClick={() => setTelegramPreview(null)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                     >
                        <X className="w-6 h-6" />
                     </button>
                     
                     <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                        <Send className="w-5 h-5 text-blue-500" /> Telegram Preview
                     </h3>

                     {/* Media Preview (Live) */}
                     <div className="mb-4 flex justify-center bg-black/30 rounded p-2 min-h-[200px] items-center relative group">
                         {telegramPreview.mediaUrl && telegramPreview.mediaUrl.match(/\.(mp4|mov|avi|webm)$/i) ? (
                             <div className="relative w-full h-full flex justify-center">
                                 <video 
                                    src={telegramPreview.mediaUrl} 
                                    controls 
                                    className="max-h-60 rounded shadow-lg"
                                 />
                                 <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                                     <Video className="w-3 h-3" /> Video Preview
                                 </div>
                             </div>
                         ) : (
                             <img 
                                src={telegramPreview.mediaUrl}
                                alt="Preview"
                                className="max-h-60 object-contain rounded shadow-lg"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image'; }}
                             />
                         )}
                     </div>

                     <div className="space-y-4">
                        {/* Editable Media URL */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Медиа URL (Зураг эсвэл .mp4 Видео линк)</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                                <input 
                                    value={telegramPreview.mediaUrl}
                                    onChange={(e) => setTelegramPreview(prev => prev ? {...prev, mediaUrl: e.target.value} : null)}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 pl-9 text-sm focus:border-blue-500 outline-none transition"
                                    placeholder="https://example.com/image.jpg or video.mp4"
                                />
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">Видео илгээх бол шууд татах линк (.mp4) оруулна уу.</p>
                        </div>

                        {/* Editable Caption */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Зурвасын агуулга (Markdown)</label>
                            <textarea 
                                value={telegramPreview.caption}
                                onChange={(e) => setTelegramPreview(prev => prev ? {...prev, caption: e.target.value} : null)}
                                className="w-full h-32 bg-neutral-900 border border-neutral-700 rounded p-3 text-sm font-mono text-gray-200 focus:border-blue-500 outline-none resize-none leading-relaxed"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Markdown ашиглах: *bold*, _italic_, [text](url)</p>
                        </div>
                     </div>
                     
                     <div className="flex justify-end gap-3 pt-4 border-t border-gray-700 mt-4">
                         <button 
                            onClick={() => setTelegramPreview(null)}
                            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm font-medium transition text-white"
                         >
                            Цуцлах
                         </button>
                         <button 
                            onClick={handleConfirmSendToTelegram}
                            disabled={!!sendingTelegramId || !telegramPreview.mediaUrl}
                            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                            {sendingTelegramId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Шууд үзэх - Илгээх
                         </button>
                     </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;