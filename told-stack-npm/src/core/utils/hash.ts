
export function hashEmail_partial(email: string) {
    const name = email
        .substr(0, email.indexOf('@'))
        .replace(/\./g, '_')
        .replace(/[^a-zA-Z0-9]/g, '')
        ;

    const h = hash(email);

    return name + h;
}

export function hash(text: string): number {
    return [...text].reduce((hash, c) => {
        const code = c.charCodeAt(0);
        hash = ((hash << 5) - hash) + code;
        return hash | 0;
    }, 0);
}
