import { Modal, Button, Spinner, Form } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import { useState } from "react";
import { toast } from "react-toastify";

import { editComment } from "../../api/apiComment";

const ModalEditComment = ({ comment, onEditSuccess }) => {
    const [show, setShow] = useState(false);
    const [data, setData] = useState(comment); // Menyimpan data komentar untuk diedit
    const [isPending, setIsPending] = useState(false);

    // Fungsi untuk menutup modal
    const handleClose = () => {
        setShow(false);
    };

    // Fungsi untuk membuka modal
    const handleShow = () => setShow(true);

    // Fungsi untuk menangani perubahan input
    const handleChange = (event) => {
        setData({ ...data, [event.target.name]: event.target.value });
    };

    // Fungsi untuk submit data edit komentar
    const submitData = (event) => {
        event.preventDefault();
        console.log("Comment Data to Submit:", data); // Log data sebelum API dipanggil
        setIsPending(true);
    
        editComment(data)
            .then((response) => {
                console.log("Response from API:", response); // Log respons dari API
                setIsPending(false);
                toast.success(response.message || "Komentar Berhasil Diubah");
                handleClose();
                onEditSuccess();
            })
            .catch((err) => {
                console.error("Error from API:", err); // Log error dengan jelas
                setIsPending(false);
                toast.error(err.message || "Failed to update comment");
            });
    };
    
    

    return (
        <>
            {/* Tombol Edit */}
            <Button variant="primary" size="sm" onClick={handleShow}>
                <FaEdit /> 
            </Button>

            {/* Modal Edit */}
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Comment</Modal.Title>
                </Modal.Header>
                <Form onSubmit={submitData}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Comment</Form.Label>
                            <Form.Control
                                type="text"
                                name="comment"
                                value={data.comment}
                                onChange={handleChange}
                                placeholder="Edit your comment here"
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" type="submit" disabled={isPending}>
                            {isPending ? (
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default ModalEditComment;
