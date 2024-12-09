<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Komentar;
use Illuminate\Http\Request;
use App\Models\Comment;
use App\Models\Contents;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class KomentarController extends Controller
{
    /**
     * Tampilkan semua komentar berdasarkan konten dan pengguna.
     */
    public function getCommentsByContent($contentId)
    {
        
        $comments = Komentar::with('user')
            ->where('id_content', $contentId)
            ->get();
            

        if ($comments->isEmpty()) {
            return response()->json(['message' => 'No comments found for this content'], 404);
        }
        return response()->json([
            'message' => 'Comments retrieved successfully',
            'data' => $comments->map(function ($comment) {
                return [
                    'idKomen' => $comment->idKomen,
                    'comment' => $comment->comment,
                    'date_added' => $comment->date_added,
                    'user' => $comment->user ? [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                    ] : null,
                ];
            }),
        ]);
        
    }


    /**
     * Tambah komentar ke konten.
     */
    public function addComment(Request $request, $contentId)
{
    $validator = Validator::make($request->all(), [
        'comment' => 'required|string|max:255',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $content = Contents::find($contentId);

    if (!$content) {
        return response()->json(['message' => 'Content not found'], 404);
    }

    $comment = Komentar::create([
        'id_user' => Auth::id(),
        'id_content' => $contentId,
        'comment' => $request->comment,
        'date_added' => now(),
    ]);

    $comment = Komentar::with('user')->find($comment->idKomen); // Tambahkan relasi

    return response()->json([
        'message' => 'Comment added successfully',
        'data' => $comment,
    ]);
}
 

    /**
     * Hapus komentar dari konten.
     */
    public function deleteComment($commentId)
    {
        $comment = Komentar::find($commentId);

        if (!$comment) {
            return response()->json(['message' => 'Comment not found'], 404);
        }

        if ($comment->id_user != Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully']);
    }

    /**
     * Edit komentar berdasarkan konten.
     */
    public function updateComment(Request $request, $commentId)
    {
        $validator = Validator::make($request->all(), [
            'comment' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $comment = komentar::find($commentId);

        if (!$comment) {
            return response()->json(['message' => 'Comment not found'], 404);
        }

        if ($comment->id_user != Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->comment = $request->comment;
        $comment->save();

        return response()->json([
            'message' => 'Comment updated successfully',
            'data' => $comment,
        ]);
    }
}
