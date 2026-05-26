export const getCreatedAtForMessage = (created_at) => {
    const hours = new Date(created_at).getHours().toString().padStart(2, '0');
    const minutes = new Date(created_at).getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
};
