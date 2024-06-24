const multer = require('multer');
const path = require('path');

const storageDisk = multer.diskStorage({
    destination: (req, file, cb) => {
        let destinationFolder;
        switch (file.fieldname) {
            case "profile":
                destinationFolder = path.resolve(__dirname, '../uploads/profiles');
                break;
            case "thumbnail":
                destinationFolder = path.resolve(__dirname, '../uploads/products');
                break;
            case "homeBill":
                destinationFolder = path.resolve(__dirname, '../uploads/documents/homeBills');
                break;
            case "bankBill":
                destinationFolder = path.resolve(__dirname, '../uploads/documents/bankBills');
                break;
            case "document":
            default:
                destinationFolder = path.resolve(__dirname, '../uploads/documents/document');
        }
        cb(null, destinationFolder);
    },
    filename: (req, file, cb) => {
        let numeroAleatorio = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
        let newName = `${numeroAleatorio}-${file.originalname}`
        cb(null, newName);
    }
});

const uploaderDocs = multer({
    storage: storageDisk,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|pdf/;
        const mimetype = filetypes.test(file.mimetype);
  
        if (mimetype) {
            return cb(null, true);
        }else {
            return cb(new Error("Error: Solo se permiten Documentos (JPEG, JPG, PNG, PDF)"));
        }
    },
});

const uploaderProds = multer({
    storage: storageDisk,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
  
        if (mimetype) {
            return cb(null, true);
        }else {
            return cb(new Error("Error: Solo se permiten imágenes (JPEG, JPG, PNG)"));
        }
    },
});

module.exports = {uploaderDocs, uploaderProds};
