const SUPER_ADMIN_EMAIL = "admin@minidrive.com";

const isSuperAdmin = (email) => {
    return email && email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
};

module.exports = {
    SUPER_ADMIN_EMAIL,
    isSuperAdmin
};
