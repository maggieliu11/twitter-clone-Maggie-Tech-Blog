import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../utils/axios'; 
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-4">
      {user && <CreatePost onPostCreated={fetchPosts} />}
      <div className="space-y-4">
        {posts.map(post => (
          <Post
            key={post._id}
            post={post}
            onPostUpdated={fetchPosts}
            onPostDeleted={fetchPosts}
          />
        ))}
      </div>
    </div>
  );
};
export default Home;