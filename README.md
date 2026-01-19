# RootNahid - Mathematics Learning Platform

RootNahid is a modern, responsive e-learning platform dedicated to mastering mathematics. Built with the cutting-edge **Next.js 16** and **Tailwind CSS 4**, this application provides a premium user experience for students and a robust management interface for administrators.

## 🚀 Features

- **Modern & Premium UI**: A custom-designed interface focusing on aesthetics and usability, featuring glassmorphism effects, smooth transitions, and a cohesive design system.
- **Dynamic Course Management**:
  - Detailed course listings with difficulty levels, departments, and pricing.
  - Interactive course curriculum viewer.
- **Video Learning Hub**:
  - Secure video delivery for paid courses.
  - Chapter and part organization (e.g., "Differentiation - Part 1").
  - Integrated lecture notes and resource links.
- **Role-Based Dashboards**:
  - **Student Dashboard**: Track progress, access purchased courses, and manage profile.
  - **Admin Dashboard**: Comprehensive tools to manage courses, students, and upload video content.
- **Video Management**:
  - Upload and edit video details including Subject, Chapter, Part, and Access Level (Free/Paid).
  - Bulk management of educational content.
- **Authentication**: Secure registration and login powered by **Firebase Authentication**.
- **Responsive Design**: Fully optimized experience across mobile, tablet, and desktop devices.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (React 19)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Authentication**: Firebase Auth
- **Backend Integration**: Axios (Consumes external Express/MongoDB API)
- **Icons**: Lucide React
- **UI Components**: Custom components with Radix-like accessibility primitives.
- **Notifications**: SweetAlert2, Sonner

## 📦 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MuntasirTonoy/RootNahid-FrontEnd.git
   cd RootNahid-FrontEnd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add your Firebase and Backend API configuration:

   ```env
   # Backend API
   NEXT_PUBLIC_API_URL=http://localhost:5000

   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── dashboard/        # Protected dashboard routes (Student/Admin)
│   ├── course/           # Course public details pages
│   ├── checkout/         # Payment and checkout flows
│   └── ...
├── components/           # Reusable UI components
├── context/              # React Context (AuthContext, etc.)
├── lib/                  # Library configurations (Firebase, generic utils)
└── ...
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
