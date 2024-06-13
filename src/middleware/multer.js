const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let destinationFolder;
        switch (file.fieldname) {
            case "profile":
                destinationFolder = path.resolve(__dirname, '../uploads/profiles');
                break;
            case "products":
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
        cb(null, file.originalname);
    }
});

const uploader = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|pdf/;
        const mimetype = filetypes.test(file.mimetype);
  
        if (mimetype) {
            return cb(null, req);
        }else {
            cb(new Error("Error: Solo se permiten imágenes (JPEG, JPG, PNG, PDF)"));
        }
    },
});

module.exports = uploader;
