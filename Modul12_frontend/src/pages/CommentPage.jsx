import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Alert, Button, Container, Spinner, Stack } from "react-bootstrap";
import { getCommentsByContent, addComment, deleteComment as apiDeleteComment } from "../api/apiComment"; // Ganti nama import
import { GetAllContents } from "../api/apiContent";
import { getThumbnail } from "../api";
import { toast } from "react-toastify";
import ModalEditComment from "../components/modals/ModalEditKomen";

const CommentPage = () => {
    const { contentId } = useParams();
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [contents, setContents] = useState([]);
    const [isPending, setIsPending] = useState(false);
    const [loggedInUserId, setLoggedInUserId] = useState(null);

   // Mengambil session saat halaman dimuat
   useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    
    setLoggedInUserId(userId ? parseInt(userId, 10) : null);
}, []);
    // Fetch all contents
    useEffect(() => {
        setIsLoading(true);
        GetAllContents()
            .then((data) => {
                setContents(data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setError("Failed to fetch contents.");
                setIsLoading(false);
            });
    }, []);

    // Fetch comments by contentId
    useEffect(() => {
        if (contentId) {
            fetchComments();
        }
    }, [contentId]);

    const fetchComments = () => {
        setIsLoading(true);
        getCommentsByContent(contentId)
            .then((data) => {
                console.log("Received comments:", data);
                setComments(data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setError("Failed to fetch comments.");
                setIsLoading(false);
            });
    };

    const handleAddComment = () => {
        if (!newComment.trim()) {
            toast.error("Komentar Tidak Boleh Kosong");
            return;
        }

        setIsPending(true);
        addComment(contentId, { comment: newComment })
            .then((data) => {
                setNewComment("");
                setIsPending(false);
                toast.success("Komentar Berhasil Ditambahkan");
                fetchComments();
            })
            .catch((err) => {
                console.log(err);
                setError("Failed to add comment.");
                setIsPending(false);
            });
    };

    

    const handleDeleteComment = (commentId) => {
        setIsPending(true);
        apiDeleteComment(commentId)
            .then(() => {
                toast.success("Comment deleted successfully!");
                fetchComments();
                setIsPending(false);
            })
            .catch((err) => {
                console.log(err);
                toast.error("Failed to delete comment.");
                setIsPending(false);
            });
    };

    if (isLoading) {
        return (
            <div className="text-center">
                <Spinner animation="border" variant="primary" size="lg" role="status" />
                <h6 className="mt-2">Loading comments...</h6>
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    const content = contents.find((content) => content.id === parseInt(contentId));

    return (
        <Container>
            {content && (
                <div className="card text-white" style={{ aspectRatio: "16 / 9" }}>
                    <img
                        src={getThumbnail(content.thumbnail)}
                        className="card-img w-100 h-100 object-fit-cover bg-light"
                        alt="Content Thumbnail"
                    />
                    <div className="card-body">
                        <h2 className="card-title text-truncate">
                            <i className="fa-solid fa-video"></i>
                            <strong> {content.title}</strong>
                        </h2>
                        <p className="card-text">{content.description}</p>
                    </div>
                </div>
            )}

            <Stack gap="3">
                <div className=" mt-3">
                    <h3>Comments</h3>
                    <p>Tuliskan komentar baru:</p>
                </div>
                <div className="container mb-3">
                    <div className="row">
                        <div className="col-11">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment"
                                className="form-control"
                            />
                        </div>
                        <div className="col-1">
                            <Button onClick={handleAddComment} disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
                                        Loading...
                                    </>
                                ) : (
                                    "Kirim"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {comments.length === 0 ? (
                    <Alert className="bg-dark">Belum ada komentar, ayo tambahin komentar!</Alert>
                ) : (
                    comments.map((comment) => {
                        return (
                            <div
                                key={`${comment.idKomen}-${contentId}`}
                                className="container py-2"
                                style={{ border: "1px solid #444", borderRadius: "8px", backgroundColor: "#1a1b29" }}
                            >
                                <div className="row align-items-center">
                                    <div className="col-auto">
                                        <img
                                            src={comment.user?.avatar || "https://via.placeholder.com/50"}
                                            alt="avatar"
                                            className="rounded-circle"
                                            style={{ width: "50px", height: "50px" }}
                                        />
                                    </div>
                                    <div className="col">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <strong style={{ color: "white" }}>{comment.user?.name}</strong>
                                            <small style={{ color: "#aaa" }}>
                                                {new Date(comment.date_added).toLocaleString("en-US", {
                                                    month: "long",
                                                    day: "numeric",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </small>
                                        </div>
                                        <p style={{ color: "white", marginBottom: "0" }}>{comment.comment}</p>
                                    </div>
                                    {comment.user?.id === loggedInUserId && (
                                        <div className="col-auto d-flex align-items-center gap-2">
                                            <ModalEditComment
                                                comment={{
                                                    commentId: comment.idKomen,
                                                    comment: comment.comment,
                                                }}
                                                onEditSuccess={fetchComments}
                                            />
                                            <Button
                                                onClick={() => handleDeleteComment(comment.idKomen)}
                                                variant="danger"
                                                size="sm"
                                                disabled={isPending}
                                            >
                                                {isPending ? (
                                                    <Spinner as="span" animation="border" size="sm" role="status" />
                                                ) : (
                                                    <i className="fa-solid fa-trash-can"></i>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                
            </Stack>
        </Container>
    );
};

export default CommentPage;
