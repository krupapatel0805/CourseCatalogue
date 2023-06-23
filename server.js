const express = require("express");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// configure express to receive form field data
app.use(express.urlencoded({ extended: true }))

// setup handlebars
const exphbs = require("express-handlebars");
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    helpers: {
        json: (context) => { return JSON.stringify(context) }
    }
}));
app.set("view engine", ".hbs");

// 1. configure mongoogse
const mongoose = require('mongoose');
mongoose.connect(
    "mongodb+srv://admin:admin@krupa.5ekbodw.mongodb.net/?retryWrites=true&w=majority"
);


// Define schema
const courseSchema = new mongoose.Schema({
    CourseTitle: String,
    CourseCode: String,
    Instructor: String,
});
const instructorSchema = new mongoose.Schema({
    Email: String,
    FirstName: String,
    LastName: String,
    Username: String
})

// 3. create your models
const Course = mongoose.model('Course', courseSchema);
const Instructor = mongoose.model('Instructor', instructorSchema)

app.post("/courseCatalogue", async (req, res) => {
    try {
        await Course.find().then((data) => {
        })
        const course = await Course.find();
        res.send("Please look at the console to get more details about courses.")
        console.log(`${course}`);
    } catch (error) {
        console.error(error);

    }
})

app.post("/instructorLookup", async (req, res) => {
    try {
        await Instructor.find().then((data) => {
        })

        const instInput = req.body.instructorName
        const instructor_db = await Instructor.findOne({ FirstName: instInput });
        const course_db = await Course.findOne({ Username: instInput });
        if (instructor_db === undefined) {
            res.send("ERROR:The instructor name is not correct.")
            console.log("ERROR:The instructor name is not correct.")
            return
        }
        else {
            res.send("The instructor name is correct. Please look at console to get more details.")
            console.log(`${instructor_db}`);
            if (course_db.Username === instructor_db.Username) {
                res.send("The instructor is assigned to a course. Please look at console to get more details.")
                console.log(`${instructor_db} ${course_db}`);

            }
            else {
                res.send("The instructor is not assigned to any course")
                console.log("The instructor is not assigned to any course")
            }
        }
    } catch (error) {
        console.error(error);
    }

})

app.post("/assignInstructor", async (req, res) => {

    const instructorUsername = req.body.instructorUsernameInput
    const courseCode = req.body.courseCodeInput
    const course_db = await Course.findOne({ CourseCode: courseCode });
    const instructor_db = await Instructor.findOne({ Username: instructorUsername });

    if (instructorUsername === undefined || courseCode === undefined) {
        res.send("ERROR:The input entered is invalid.")
    }
    else {
        if (course_db.Instructor.length === 0) {
            let courseCount = 0;
            Instructor.find(async (error, var1) => {
                if (error) {
                    console.log(error);
                } else {
                    var1.forEach((var2) => {
                        if (var2.Instructor === instructorUsername) {
                            courseCount++;
                        }
                    });
                    if (courseCount > 2 || courseCount < 0) {
                        res.send("ERROR: The instructor is already assigned to three courses. So, no more courses can be assigned.")
                        console.log("ERROR: The instructor is already assigned to three courses. So, no more courses can be assigned.")
                        return
                    }
                    else {
                        course_db.Instructor = instructorUsername;
                        await course_db.save();
                        res.send("Instructor assigned.")
                    }
                }
                });
        }
        else{
            res.send("ERROR:Can not assign the instructor to the course as the course already have an instructor assigned.")
            console.log("ERROR:Can not assign the instructor to the course as the course already have an instructor assigned.")
            return
        }
    }
})


// endpoints
app.get("/courseCatalogue", (req, res) => {
    return res.send("Welcome to /courseCatalogue endpoint")
})

app.get("/instructorLookup", (req, res) => {
    return res.send("Welcome to /instructorLookup endpoint")
})

app.get("/assignInstructor", (req, res) => {
    res.send("Welcome here")
})

app.get("/", (req, res) => {
    res.render("index", { layout: "" })
})

// start server
const onHttpStart = () => {
    console.log("Express http server listening on: " + HTTP_PORT);
    console.log(`http://localhost:${HTTP_PORT}`);
}
app.listen(HTTP_PORT, onHttpStart)