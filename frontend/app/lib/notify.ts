import { toast } from "sonner";

export const notify = {
    success(
        title: string,
        description?: string
    ) {
        toast.success(title, {
            description,
        });
    },

    error(
        title: string,
        description?: string
    ) {
        toast.error(title, {
            description,
        });
    },

    info(
        title: string,
        description?: string
    ) {
        toast(title, {
            description,
        });
    },

    loading(title: string) {
        return toast.loading(title);
    },

    dismiss(id?: string | number) {
        toast.dismiss(id);
    },

    promise: toast.promise,
};