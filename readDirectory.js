import fs from 'fs';

const directoryPath = '/Users/lalo/Documents/TheFullStackCourse';

fs.readdir(directoryPath, (err, files) => {
    console.log(files)
});