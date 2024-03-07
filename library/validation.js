const { get422 } = require("./response-library");
const { Basics, Users, Tokens, Parent, Chunk} = require("../database/database-library");

class Validator {
    constructor() {
        this.errors = {};
    }

    statusValidation;
    errorInfo;

    required(field, value) {
        if (value === undefined || value === null || value === '') {
            this.addError(`The ${field} field is required.`, field);
        }
    }

    string(field, value) {
        if (typeof value !== 'string') {
            this.addError(`The ${field} field must be a string.`, field);
        }
    }

    int(field, value) {
        if (!Number.isInteger(value)) {
            this.addError(`The ${field} field must be an integer.`, field);
        }
    }

    double(field, value) {
        if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
            this.addError(`The ${field} field must be a double.`, field);
        }
    }

    regex(field, value, pattern) {
        const regex = new RegExp(pattern);
        if (!regex.test(value)) {
            this.addError(`The ${field} field does not match the required pattern.`, field);
        }
    }

    uuid(field, value) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(value)) {
            this.addError(`The ${field} field must be a valid UUID.`, field);
        }
    }

    nullable(field, value) {
        if (value !== null && value !== undefined && value !== '') {
            this.addError(`The ${field} field must be nullable.`, field);
        }
    }

    alpha(field, value) {
        if (!/^[a-zA-Z]+$/.test(value)) {
            this.addError(`The ${field} field must contain only alphabetic characters.`, field);
        }
    }

    alphaNum(field, value) {
        if (/^[a-zA-Z]+$/.test(value)) {
            this.addError(`The ${field} field must contain at least one numeric character.`, field);
        } else if (/^\d+$/.test(value)) {
            this.addError(`The ${field} field must contain at least one alphabetic character.`, field);
        } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
            this.addError(`The ${field} field must contain only alphanumeric characters.`, field);
        }
    }
    

    numeric(field, value) {
        if (isNaN(value)) {
            this.addError(`The ${field} field must be numeric.`, field);
        }
    }

    between(field, value, min, max) {
        if (value.length < min || value.length > max) {
            this.addError(`The ${field} field must be between ${min} and ${max}.`, field);
        }
    }

    file(field, value) {
        if (value === undefined || value === null || value === '') {
            this.addError(`The ${field} field is required.`, field);
        } else if (typeof value !== 'object') {
            this.addError(`The ${field} field must be a file.`, field);
        }
    }

    // to check file size
    fileSize(field, value, size, unit) {
        const fileSizeBytes = value.length; // Get file size in bytes
        console.log(`File size in bytes: ${fileSizeBytes}`);
        // Convert to MB or GB based on validation size unit
        let fileSize;
        if (unit === 'MB') {
            fileSize = fileSizeBytes / (1024 * 1024); // Convert to MB
        } else if (unit === 'GB') {
            fileSize = fileSizeBytes / (1024 * 1024 * 1024); // Convert to GB
        }
        console.log(`File size in ${unit}: ${fileSize}`);
        if (fileSize > size) {
            this.addError(`The ${field} field must be less than ${size}${unit}.`, field);
        }
      }
      

    fileExtension(field, value, ext) {
        if (!ext.includes(value)) {
            this.addError(`The ${field} field must be a ${ext} file.`, field);
        }
    }

    async exists(field, value, table, column) {
        try {
            const record = await table.findOne({ [column]: value });
            if (record) {
                this.addError(`The ${field} value already exists. Please use another value.`, field);
            }
        } catch (error) {
            console.error('Error checking existence in database:', error);
            this.addError(`An error occurred while checking the existence of ${field}. Please try again.`, field);
        }
    }
    


    addError(message, field) {
        if (!this.errors[field]) {
            this.errors[field] = [];
        }
        this.errors[field].push(message);
    }

    validate(data, rules, res) {
        this.errors = {};

        for (const field in rules) {
            const fieldRules = rules[field].split('|');
            for (const rule of fieldRules) {
                const [ruleName, ruleParam] = rule.split(':');
                switch (ruleName) {
                    case 'required':
                        this.required(field, data[field]);
                        break;
                    case 'string':
                        this.string(field, data[field]);
                        break;
                    case 'int':
                        this.int(field, data[field]);
                        break;
                    case 'double':
                        this.double(field, data[field]);
                        break;
                    case 'regex':
                        this.regex(field, data[field], ruleParam);
                        break;
                    case 'uuid':
                        this.uuid(field, data[field]);
                        break;
                    case 'nullable':
                        this.nullable(field, data[field]);
                        break;
                    case 'alpha':
                        this.alpha(field, data[field]);
                        break;
                    case 'alpha_num':
                        this.alphaNum(field, data[field]);
                        break;
                    case 'numeric':
                        this.numeric(field, data[field]);
                        break;
                    case 'between':
                        const [min, max] = ruleParam.split(',');
                        this.between(field, data[field], min, max);
                        break;
                    case 'exists':
                        const [table, column] = ruleParam.split(',');
                        this.exists(field, data[field], table, column);
                        break;
                    case 'file':
                        this.file(field, data[field]);
                        break;
                    case 'file_size':
                        // ruleParame like 15MB or 20GB
                        const [size, unit] = ruleParam.match(/\d+|\D+/g); // [15, 'MB']
                        this.fileSize(field, data[field], size, unit);
                        break;
                    case 'file_extension':
                        this.fileExtension(field, data[field], ruleParam.split(','));
                        break;
                    default:
                        break;
                }
            }
        }

        if (Object.keys(this.errors).length > 0) {
            const errorMessage = this.errors;
            console.log('Validation errors:', errorMessage);
            this.errorInfo = errorMessage;
            this.statusValidation = false;
            return this.statusValidation;
        }

        const reqBody = {};
        for (const field in rules) {
            reqBody[field] = data[field];
        }
        return reqBody;
    }

    errorResponse(errors) {
        console.log('Validation errors1:', errors);
        return errors
    }
}

module.exports = Validator;
