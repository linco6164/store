import { api } from "../lib/api";

export async function uploadImages(files: File[], folder = "listings") {
    const formData = new FormData();

    files.forEach((file) => {
        formData.append("images", file);
    });
    formData.append("folder", folder);

    const { data } = await api.post("/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return data.urls as string[];
}
