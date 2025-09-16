import React from "react";
import { Route, Routes, useMatch } from "react-router-dom";
import "quill/dist/quill.snow.css";
import {ToastContainer} from 'react-toastify';

// Student Imports
import Home from "./pages/student/Home.jsx";
import CoursesList from "./pages/student/CoursesList.jsx";
import CourseDetails from "./pages/student/CourseDetails.jsx";
import MyEnrollments from "./pages/student/MyEnrollments.jsx";
import Player from "./pages/student/Player.jsx";
import Loading from "./components/student/Loading.jsx";

// Educator Imports
import Educator from "./pages/educator/Educator.jsx";
import Dashboard from "./pages/educator/Dashboard.jsx";
import AddCourse from "./pages/educator/AddCourse.jsx";
import MyCourses from "./pages/educator/MyCourses.jsx";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled.jsx";
import Navbar from "./components/student/Navbar.jsx";

const App = () => {
  const isEducatorRoute = useMatch("/educator/*");
  return (
    <div className="text-default min-h-screen bg-white">
      <ToastContainer></ToastContainer>
      {!isEducatorRoute &&<Navbar> </Navbar> }
      <Routes>
        {/* Student Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/courseList" element={<CoursesList />} />
        <Route path="/courseList/:input" element={<CoursesList />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/myEnrollments" element={<MyEnrollments />} />
        <Route path="/player/:courseId" element={<Player />} />
        <Route path="/loading/:path" element={<Loading />} />

        {/* Educator Routes with Nested Routing */}
        <Route path="/educator" element={<Educator />}>
          <Route index element={<Dashboard />} /> {/* default route */}
          <Route path="addCourse" element={<AddCourse />} />
          <Route path="myCourses" element={<MyCourses />} />
          <Route path="studentsEnrolled" element={<StudentsEnrolled />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
