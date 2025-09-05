import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  Send,
  Edit3,
  Trash2,
  Pin,
  PinOff,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Smile,
  Frown,
  MoreVertical,
  User,
  Clock,
  Lock,
  Reply,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const CommentsSection = ({ targetType, targetId, className = '' }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [showPrivate, setShowPrivate] = useState(false);
  const [expandedComments, setExpandedComments] = useState(new Set());

  // Kommentare laden
  const loadComments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/comments/${targetType}/${targetId}?include_private=${showPrivate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      } else {
        console.error('Fehler beim Laden der Kommentare');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Kommentare:', error);
      toast.error('Fehler beim Laden der Kommentare');
    } finally {
      setLoading(false);
    }
  };

  // Kommentar erstellen
  const createComment = async (content, parentId = null, isPrivate = false) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          target_type: targetType,
          target_id: targetId,
          parent_comment_id: parentId,
          is_private: isPrivate
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Kommentar erfolgreich erstellt');
        loadComments();
        return data.comment;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Erstellen des Kommentars');
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Kommentars:', error);
      toast.error(error.message);
    }
  };

  // Kommentar bearbeiten
  const editComment = async (commentId, content) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        toast.success('Kommentar erfolgreich bearbeitet');
        loadComments();
        setEditingComment(null);
        setEditContent('');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Bearbeiten des Kommentars');
      }
    } catch (error) {
      console.error('Fehler beim Bearbeiten des Kommentars:', error);
      toast.error(error.message);
    }
  };

  // Kommentar löschen
  const deleteComment = async (commentId) => {
    if (!window.confirm('Möchten Sie diesen Kommentar wirklich löschen?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Kommentar erfolgreich gelöscht');
        loadComments();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Löschen des Kommentars');
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Kommentars:', error);
      toast.error(error.message);
    }
  };

  // Kommentar anheften/abheften
  const togglePin = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/comments/${commentId}/toggle-pin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Pin-Status geändert');
        loadComments();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Ändern des Pin-Status');
      }
    } catch (error) {
      console.error('Fehler beim Ändern des Pin-Status:', error);
      toast.error(error.message);
    }
  };

  // Reaktion hinzufügen/entfernen
  const toggleReaction = async (commentId, reactionType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/comments/${commentId}/reactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reaction_type: reactionType })
      });

      if (response.ok) {
        loadComments();
      } else {
        const error = await response.json();
        console.error('Fehler bei Reaktion:', error);
      }
    } catch (error) {
      console.error('Fehler bei Reaktion:', error);
    }
  };

  // Kommentar-Thread erweitern/reduzieren
  const toggleExpanded = (commentId) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  // Datum formatieren
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'vor wenigen Minuten';
    } else if (diffInHours < 24) {
      return `vor ${Math.floor(diffInHours)} Stunden`;
    } else if (diffInHours < 48) {
      return 'gestern';
    } else {
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Reaktion-Icons
  const getReactionIcon = (type) => {
    switch (type) {
      case 'like': return <ThumbsUp className="w-4 h-4" />;
      case 'dislike': return <ThumbsDown className="w-4 h-4" />;
      case 'helpful': return <Heart className="w-4 h-4" />;
      case 'confused': return <Frown className="w-4 h-4" />;
      case 'celebrate': return <Smile className="w-4 h-4" />;
      default: return null;
    }
  };

  // Kommentar-Komponente
  const CommentItem = ({ comment, level = 0 }) => {
    const isExpanded = expandedComments.has(comment.comment_id);
    const hasReplies = comment.reply_count > 0;
    const canEdit = user && (user.id === comment.author_id || user.role === 'admin');
    const canPin = user && (user.id === comment.author_id || user.role === 'admin');

    return (
      <div className={`${level > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
        <div className={`bg-white rounded-lg border ${comment.is_pinned ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'} p-4 mb-3`}>
          {/* Kommentar-Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{comment.author_username}</span>
                  {comment.is_private && <Lock className="w-4 h-4 text-gray-500" />}
                  {comment.is_pinned && <Pin className="w-4 h-4 text-yellow-500" />}
                  {comment.is_edited && (
                    <span className="text-xs text-gray-500">(bearbeitet)</span>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(comment.created_at)}</span>
                  {comment.edited_at && (
                    <span>• Bearbeitet: {formatDate(comment.edited_at)}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {canPin && (
                <button
                  onClick={() => togglePin(comment.comment_id)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title={comment.is_pinned ? 'Abheften' : 'Anheften'}
                >
                  {comment.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                </button>
              )}
              
              {canEdit && (
                <>
                  <button
                    onClick={() => {
                      setEditingComment(comment.comment_id);
                      setEditContent(comment.content);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Bearbeiten"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteComment(comment.comment_id)}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                    title="Löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Kommentar-Inhalt */}
          {editingComment === comment.comment_id ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                rows="3"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => editComment(comment.comment_id, editContent)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                >
                  Speichern
                </button>
                <button
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent('');
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-800 whitespace-pre-wrap">{comment.content}</div>
          )}

          {/* Reaktionen */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-4">
              {['like', 'dislike', 'helpful', 'confused', 'celebrate'].map((reactionType) => {
                const count = comment.reaction_counts?.[reactionType] || 0;
                const hasReacted = comment.user_reactions?.[reactionType] || false;
                
                return (
                  <button
                    key={reactionType}
                    onClick={() => toggleReaction(comment.comment_id, reactionType)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm ${
                      hasReacted 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {getReactionIcon(reactionType)}
                    {count > 0 && <span>{count}</span>}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setReplyingTo(comment.comment_id);
                  setReplyContent('');
                }}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
              >
                <Reply className="w-4 h-4" />
                <span>Antworten</span>
              </button>
              
              {hasReplies && (
                <button
                  onClick={() => toggleExpanded(comment.comment_id)}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span>{comment.reply_count} Antwort{comment.reply_count !== 1 ? 'en' : ''}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Antworten */}
        {hasReplies && isExpanded && (
          <div className="space-y-2">
            {comments
              .filter(c => c.parent_comment_id === comment.comment_id)
              .map(reply => (
                <CommentItem key={reply.comment_id} comment={reply} level={level + 1} />
              ))}
          </div>
        )}
      </div>
    );
  };

  // Antwort-Formular
  const ReplyForm = ({ parentId, onCancel }) => {
    const [content, setContent] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!content.trim()) return;

      await createComment(content, parentId, isPrivate);
      setContent('');
      setIsPrivate(false);
      onCancel();
    };

    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Antwort schreiben..."
            className="w-full p-3 border border-gray-300 rounded-md resize-none"
            rows="3"
            required
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Privater Kommentar</span>
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                Antworten
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  };

  useEffect(() => {
    loadComments();
  }, [targetType, targetId, showPrivate]);

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Kommentare ({comments.length})
          </h3>
        </div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showPrivate}
            onChange={(e) => setShowPrivate(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-600">Private Kommentare anzeigen</span>
        </label>
      </div>

      {/* Neuer Kommentar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!newComment.trim()) return;
          
          const isPrivate = e.target.isPrivate?.checked || false;
          await createComment(newComment, null, isPrivate);
          setNewComment('');
          e.target.isPrivate.checked = false;
        }} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Kommentar schreiben..."
            className="w-full p-3 border border-gray-300 rounded-md resize-none"
            rows="3"
            required
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isPrivate"
                className="rounded"
              />
              <span className="text-sm text-gray-600">Privater Kommentar</span>
            </label>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Send className="w-4 h-4" />
              <span>Kommentar hinzufügen</span>
            </button>
          </div>
        </form>
      </div>

      {/* Kommentare */}
      <div className="space-y-3">
        {comments
          .filter(comment => !comment.parent_comment_id)
          .sort((a, b) => {
            // Angeheftete Kommentare zuerst, dann nach Datum
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            return new Date(b.created_at) - new Date(a.created_at);
          })
          .map(comment => (
            <div key={comment.comment_id}>
              <CommentItem comment={comment} />
              {replyingTo === comment.comment_id && (
                <ReplyForm
                  parentId={comment.comment_id}
                  onCancel={() => setReplyingTo(null)}
                />
              )}
            </div>
          ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Noch keine Kommentare vorhanden.</p>
          <p className="text-sm">Seien Sie der Erste, der einen Kommentar hinzufügt!</p>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
