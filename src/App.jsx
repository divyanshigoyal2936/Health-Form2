import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import './App.css';

// Component: Gender/Profile Selection
const GenderSelect = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-purple-300 to-blue-300">
      <h1 className="text-3xl font-bold mb-8">Choose Your Profile Type</h1>
      <div className="flex gap-12 flex-wrap justify-center">
        <Card label="Pregnant Woman" image="pregnant-woman.png" onClick={() => navigate('/form/pregnant_woman')} />
        <Card label="Malnourished Child" image="child.png" onClick={() => navigate('/form/malnourished_child')} />
        <Card label="Newborn" image="newborn.png" onClick={() => navigate('/form/newborn')} />
      </div>
    </div>
  );
};

const Card = ({ label, image, onClick }) => (
  <div onClick={onClick} className="cursor-pointer">
    <img src={image} alt={label} className="w-64 h-auto rounded-xl shadow-xl hover:scale-105 transition-transform duration-300" />
    <p className="text-center mt-2 font-semibold text-xl">{label}</p>
  </div>
);

// Component: Form Page
const FormPage = () => {
  const { userType } = useParams();
  return <FormTemplate userType={userType} />;
};

const FormTemplate = ({ userType }) => {
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    location: '',
    diet_type: '',
    monthly_income: '',
    food_availability: [],
    known_health_issues: [],
    ...(userType === 'pregnant_woman' && { pregnant: 'yes' })
  });

  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
          ? [...(prev[name] || []), value]
          : prev[name].filter(item => item !== value),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
  const res = await fetch("/api/recommend", {
    method: "POST",
    body: JSON.stringify(formData),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (!res.ok || !data.output || !data.output.mealPlan) {
    throw new Error("Invalid response from server");
  }

  setOutput(data.output.mealPlan);
} catch (err) {
  console.error(err);
  setError("Failed to get recommendations");
}
 finally {
      setIsLoading(false);
    }
  };

  if (recommendations) {
    return (
      <div className="p-6 max-w-4xl mx-auto mt-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Your Personalized Nutrition Plan</h2>

        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Your Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><span className="font-medium">Age:</span> {formData.age}</p>
            <p><span className="font-medium">Weight:</span> {formData.weight} kg</p>
            <p><span className="font-medium">Height:</span> {formData.height} cm</p>
            <p><span className="font-medium">Location:</span> {formData.location}</p>
            <p><span className="font-medium">Diet Type:</span> {formData.diet_type}</p>
            {formData.known_health_issues.length > 0 && (
              <p><span className="font-medium">Health Issues:</span> {formData.known_health_issues.join(', ')}</p>
            )}
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4 text-blue-700">Nutrition Plan</h3>
          <div className="whitespace-pre-wrap">{recommendations}</div>
        </div>

        <button
          onClick={() => setRecommendations(null)}
          className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Back to Form
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-4xl mx-auto mt-10 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Enter Information for {userType.replace('_', ' ')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Age" name="age" value={formData.age} onChange={handleChange} />
        <InputField label="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} />
        <InputField label="Height (cm)" name="height" value={formData.height} onChange={handleChange} />
        <InputField label="Monthly Income (₹)" name="monthly_income" value={formData.monthly_income} onChange={handleChange} />
      </div>

      <SelectField label="Location" name="location" value={formData.location} onChange={handleChange} options={[
        'Ballia, Uttar Pradesh', 'Fatehpur, Uttar Pradesh', 'Chitrakoot, Uttar Pradesh', 'Kaushambi, Uttar Pradesh',
        'Gonda, Uttar Pradesh', 'Sitapur, Uttar Pradesh', 'Basti, Uttar Pradesh', 'Deoria, Uttar Pradesh',
        'Mau, Uttar Pradesh', 'Sultanpur, Uttar Pradesh'
      ]} />

      <SelectField label="Diet Type" name="diet_type" value={formData.diet_type} onChange={handleChange} options={[
        'Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'
      ]} />

      <CheckboxGroup label="Commonly Available Foods" name="food_availability" values={formData.food_availability} onChange={handleChange} options={[
        'dal', 'roti', 'spinach', 'milk', 'jaggery', 'eggs', 'rice', 'chicken', 'fish', 'vegetables',
        'poha', 'chana', 'soybeans', 'potatoes', 'banana', 'ghee', 'peas'
      ]} />

      <CheckboxGroup label="Known Health Issues" name="known_health_issues" values={formData.known_health_issues} onChange={handleChange} options={[
        'anemia', 'underweight', 'gestational diabetes', 'low hemoglobin', 'mild edema', 'mild malnutrition'
      ]} />

      {error && <p className="text-red-500 mt-4">{error}</p>}
      <button type="submit" disabled={isLoading} className="mt-6 w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600">
        {isLoading ? 'Loading...' : 'Get Nutrition Plan'}
      </button>
    </form>
  );
};

// Reusable Components
const InputField = ({ label, name, value, onChange }) => (
  <div>
    <label className="block font-medium mb-1">{label}</label>
    <input type="number" name={name} value={value} onChange={onChange} required className="w-full p-2 border rounded" />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div className="mt-4">
    <label className="block font-medium mb-1">{label}</label>
    <select name={name} value={value} onChange={onChange} required className="w-full p-2 border rounded">
      <option value="">Select {label}</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const CheckboxGroup = ({ label, name, values, onChange, options }) => (
  <div className="mt-4">
    <label className="block font-medium mb-1">{label}</label>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {options.map(opt => (
        <label key={opt} className="flex items-center">
          <input
            type="checkbox"
            name={name}
            value={opt}
            checked={values.includes(opt)}
            onChange={onChange}
            className="mr-2"
          />
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </label>
      ))}
    </div>
  </div>
);

// App Wrapper with Routes
const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<GenderSelect />} />
      <Route path="/form/:userType" element={<FormPage />} />
    </Routes>
  </Router>
);

export default App;
