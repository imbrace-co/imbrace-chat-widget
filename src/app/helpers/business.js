
export const getSenderInfo = (channel_id, from, userList) => {
    const sender = userList?.find((user) => user.id === from);

    const firstName = sender?.first_name?.substring(0, 1) || '';
    const lastName = sender?.last_name?.substring(0, 1) || '';
    const channelInfo = JSON.parse(window.localStorage.getItem(channel_id) || '{}')

    // Server stamps outgoing messages with `from: con_<uuid>` (the contact id).
    // After the postContact migration the bootstrap token in `channelInfo.token`
    // is the agent/user token, not the contact id, so compare against the
    // contact id we stashed alongside it.
    return {
        isSentFromUser: from === channelInfo?.contact_id,
        avatar: sender?.avatar_url || '',
        shortName: `${firstName}${lastName}`,
        displayName: sender?.display_name || '',
    };
};

export const getUrlFromMessage = (text) => {
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_.~#?&//=]*)/;

    const matched = text.match(urlRegex);

    return matched && matched.length > 0 ? matched[0] : null;
};
