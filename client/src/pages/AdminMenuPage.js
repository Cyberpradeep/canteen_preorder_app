import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

function AdminMenuPage() {
  const { token } = useContext(AuthContext);
  const [menu, setMenu] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: '' });

  const fetchMenu = () => {
    axios.get('/api/menu').then(res => setMenu(res.data));
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAdd = async () => {
    try {
      await axios.post('/api/menu', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMenu();
      setFormData({ name: '', description: '', price: '', category: '' });
    } catch {
      alert("Failed to add item");
    }
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/menu/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchMenu();
  };

  return (
    <div className="container mt-4">
      <h2>Manage Menu</h2>

      <div className="card p-3 mb-4">
        <h5>Add New Item</h5>
        <input type="text" name="name" className="form-control mb-2" placeholder="Name" value={formData.name} onChange={handleChange} />
        <input type="text" name="description" className="form-control mb-2" placeholder="Description" value={formData.description} onChange={handleChange} />
        <input type="number" name="price" className="form-control mb-2" placeholder="Price" value={formData.price} onChange={handleChange} />
        <input type="text" name="category" className="form-control mb-2" placeholder="Category" value={formData.category} onChange={handleChange} />
        <button className="btn btn-success" onClick={handleAdd}>Add Item</button>
      </div>

      <h4>Menu Items</h4>
      {menu.map(item => (
        <div key={item._id} className="card p-3 mb-2">
          <h5>{item.name} <small className="text-muted">₹{item.price}</small></h5>
          <p>{item.description}</p>
          <button className="btn btn-danger" onClick={() => handleDelete(item._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default AdminMenuPage;
