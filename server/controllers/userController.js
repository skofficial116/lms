import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Course from "../models/Course.js";
import Stripe from "stripe";

export const getUserData = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User Not Found",
      });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const userData = await User.findById(userId).populate("_enrolledCourses");

    res.json({ success: true, enrolledCourse: userData._enrolledCourses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userId = req.auth.userId;
    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);
    if (!userData || !courseData) {
      return res.json({ success: false, message: "Data not found" });
    }
    const purchaseData = {
      courseId: courseData._id,
      userId,
      amount: (
        courseData.coursePrice -
        (courseData.discount * courseData.coursePrice) / 100
      ).toFixed(2),
    };

    const newPurchase = await Purchase.create(purchaseData);

    const strikeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    const currency = process.env.CURRENCY.toLowerCase();

    const line_items = [
      {
        price_data: {
          currency,
          product_data: {
            name: courseData.courseTitle,
          },
          unit_amount: Math.floor(newPurchase.amount) * 100,
        },
        quantity: 1,
      },
    ];
    const session_url = await strikeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/myEnrollments`,
      cancel_url: `${origin}`,
      line_items: line_items,
      mode: "payment",
      metadata: {
        purchaseId: newPurchase._id.toString(),
      },
    });
    res.json({ success: true, session_url: session_url });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId, lectureId } = req.body;

    const progressData = await CourseProgress.findOne(
      { userId, courseId },
      { progress }
    );

    if (!progressData) {
      if (progressData.lectureCompleted.includes(lectureId)) {
        return res.json({
          success: true,
          message: "Lecture already completed",
        });
      }

      progressData.lectureCompleted.push(lectureId);
      await progressData.save();
    } else {
      await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId],
      });
    }

    res.json({
      success: true,
      progressData,
      message: "Progress updated successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId, lectureId } = req.body;

    const progressData = await CourseProgress.findOne({ userId, courseId });

    if (!progressData) {
      return res.json({ success: false, message: "No progress found" });
    }

    res.json({ success: true, progressData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const addUserRating = async (req, res) => {
  const userId = req.auth.userId;
  const { courseId, rating } = req.body;

  if (!courseId || !rating || !userId || rating < 1 || rating > 5) {
    return res.json({ success: false, message: "Invalid Data" });
  }
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.json({ success: false, message: "Course Not Found" });
    }
    const user = await User.findById(userId);
    if (!user || user.enrolledCourses.includes(courseId)) {
      return res.json({
        success: false,
        message: "User not enrolled in the course",
      });
    }

    const existingRatingIndex = course.courseRatings.findIndex(
      (r) => r.userId === userId
    );

    if (existingRatingIndex > -1) {
      course.courseRatings[existingRatingIndex].rating = rating;
    } else {
      course.courseRatings.push({ userId, rating });
    }

    await course.save();
    res.json({ success: true, message: "Rating added successfully"});
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
