// apiComment.js
import axios from "axios";
import useAxios from ".";

// Get comments by content ID
export const getCommentsByContent = async (contentId) => {
    try {
        const response = await useAxios.get(`/comments/${contentId}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
        });

        // Jika respons status adalah 404, kembalikan array kosong
        if (response.status === 404) {
            return [];
        }

        return response.data.data; // Mengembalikan data komentar jika berhasil
    } catch (error) {
        // Jika error karena respons 404, kembalikan array kosong
        if (error.response && error.response.status === 404) {
            return [];
        }

        // Lempar error untuk kasus lain
        throw error.response ? error.response.data : error;
    }
};


// Add a new comment
export const addComment = async (contentId, commentData) => {
    try {
        const response = await useAxios.post(`/comments/${contentId}`, commentData, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Delete a comment by ID
export const deleteComment = async (commentId) => {
 
    try {
        const response = await useAxios.delete(`/comments/${commentId}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
    
};

// Edit a comment
export const editComment = async (commentData) => {
    try {
        const response = await useAxios.put(`/comments/${commentData.commentId}`, commentData, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
        });
        return response.data; // Pastikan ini mengembalikan data yang benar
    } catch (error) {
        console.error("Error editing comment:", error.response?.data || error.message);
        throw error.response?.data || error; // Tangani error dengan baik
    }
};

