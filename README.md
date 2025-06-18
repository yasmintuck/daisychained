# daisychained
An educational microlearning platform designed for schools and colleges, built as a full-stack web application.

---

## 🚀 Tech Stack

**Frontend:**
- React (Vite)
- JavaScript (ES6+)
- Deployed via Vercel

**Backend:**
- ASP.NET Core (.NET 8)
- Web API with Swagger (OpenAPI)
- Deployed via Azure App Service

**Database:**
- PostgreSQL (planned via Azure)

**DevOps:**
- GitHub Actions for CI/CD
- Monorepo structure

---

## 📁 Folder Structure
daisychained/
├── backend/ # ASP.NET Core Web API
│ ├── Controllers/
│ ├── Models/
│ ├── Program.cs
│ └── ...
├── frontend/ # React + Vite frontend
│ ├── src/
│ ├── App.jsx
│ └── ...
└── .github/ # GitHub Actions workflows

## 🔗 Deployment Links

**Frontend (Vercel):**  
[https://daisychained.vercel.app](https://daisychained.vercel.app)

**Backend (Azure Web App):**  
[https://daisychained-api-dcargvh9h6d0fkgh.uksouth-01.azurewebsites.net](https://daisychained-api-dcargvh9h6d0fkgh.uksouth-01.azurewebsites.net)

**Swagger Docs:**  
[https://daisychained-api-dcargvh9h6d0fkgh.uksouth-01.azurewebsites.net/swagger](https://daisychained-api-dcargvh9h6d0fkgh.uksouth-01.azurewebsites.net/swagger)

---

## 💡 Coming Soon (Phase 3+)
- Dynamic routes: `/modules`, `/progress`
- Database integration
- Auth layer (API key or user roles)
- Admin dashboard

---

## 🛠️ Local Development

### Frontend:
cd frontend
npm install
npm run dev

### Backend:
cd backend
dotnet run