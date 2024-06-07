const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let destinationFolder;
        switch (file.fieldname) {
            case "profile":
                destinationFolder = path.resolve(__dirname, '../src/uploads/profiles');
                break;
            case "products":
                destinationFolder = path.resolve(__dirname, '../src/uploads/products');
                break;
            case "homeBill":
                destinationFolder = path.resolve(__dirname, '../src/uploads/homeBills');
                break;
            case "bankBill":
                destinationFolder = path.resolve(__dirname, '../src/uploads/bankBills');
                break;
            case "document":
            default:
                destinationFolder = path.resolve(__dirname, '../src/uploads/documents');
        }
        console.log('destinoo', destinationFolder)
        cb(null, destinationFolder);
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const uploader = multer({ storage: storage });

module.exports = uploader;
