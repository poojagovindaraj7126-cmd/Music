import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import './sidebar.css'

function Songs() {
  const [items, setItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [playlist, setPlaylist] = useState([]);  
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch all items
    axios.get('http://localhost:3000/items')
      .then(response => setItems(response.data))
      .catch(error => console.error('Error fetching items: ', error));

  // Fetch favorites items
      axios.get('http://localhost:3000/favorities')
      .then(response => setWishlist(response.data))
      .catch(error => {
        console.error('Error fetching Favorites:', error);
        // Initialize wishlist as an empty array in case of an error
        setWishlist([]);
      });
  
    // Fetch playlist items
    axios.get('http://localhost:3000/playlist')
      .then(response => setPlaylist(response.data))
      .catch(error => {
        console.error('Error fetching playlist: ', error);
        // Initialize playlist as an empty array in case of an error
        setPlaylist([]);
      });
      // Function to handle audio play
    const handleAudioPlay = (itemId, audioElement) => {
        if (currentlyPlaying && currentlyPlaying !== audioElement) {
          currentlyPlaying.pause(); // Pause the currently playing audio
        }
        setCurrentlyPlaying(audioElement); // Update the currently playing audio
       
      };
  
      // Event listener to handle audio play
      const handlePlay = (itemId, audioElement) => {
        audioElement.addEventListener('play', () => {
          handleAudioPlay(itemId, audioElement);
        });
      };
  
      // Add event listeners for each audio element
      items.forEach((item) => {
        const audioElement = document.getElementById(`audio-${item.id}`);
        if (audioElement) {
          handlePlay(item.id, audioElement);
        }
      });
  
      // Cleanup event listeners
      return () => {
        items.forEach((item) => {
          const audioElement = document.getElementById(`audio-${item.id}`);
          if (audioElement) {
            audioElement.removeEventListener('play', () => handleAudioPlay(item.id, audioElement));
          }
        });
      };
  }, [items,currentlyPlaying, searchTerm]);
  

  const addToWishlist = async (itemId) => {
    try {
      const selectedItem = items.find((item) => item.id === itemId);
      if (!selectedItem) {
        throw new Error('Selected item not found');
      }
      const { title, imgUrl, genre, songUrl, singer, id: itemId2 } = selectedItem;
      await axios.post('http://localhost:3000/favorities', { itemId: itemId2, title, imgUrl, genre, songUrl, singer });
      const response = await axios.get('http://localhost:3000/favorities');
      setWishlist(response.data);
    } catch (error) {
      console.error('Error adding item to wishlist: ', error);
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      // Find the item in the wishlist by itemId
      const selectedItem = wishlist.find((item) => item.itemId === itemId);
      if (!selectedItem) {
        throw new Error('Selected item not found in wishlist');
      }
      // Make a DELETE request to remove the item from the wishlist
      await axios.delete(`http://localhost:3000/favorities/${selectedItem.id}`);
      // Refresh the wishlist items
      const response = await axios.get('http://localhost:3000/favorities');
      setWishlist(response.data);
    } catch (error) {
      console.error('Error removing item from wishlist: ', error);
    }
  };
  
  const isItemInWishlist = (itemId) => {
    return wishlist.some((item) => item.itemId === itemId);
  };

  
  const addToPlaylist = async (itemId) => {
    try {
      const selectedItem = items.find((item) => item.id === itemId);
      if (!selectedItem) {
        throw new Error('Selected item not found');
      }
      const { title, imgUrl, genre, songUrl, singer, id: itemId2 } = selectedItem;
      await axios.post('http://localhost:3000/playlist', { itemId: itemId2, title, imgUrl, genre, songUrl, singer });
      const response = await axios.get('http://localhost:3000/playlist');
      setPlaylist(response.data);
    } catch (error) {
      console.error('Error adding item to playlist: ', error);
    }
  };

  const removeFromPlaylist = async (itemId) => {
    try {
      // Find the item in the wishlist by itemId
      const selectedItem = playlist.find((item) => item.itemId === itemId);
      if (!selectedItem) {
        throw new Error('Selected item not found in wishlist');
      }
      // Make a DELETE request to remove the item from the wishlist
      await axios.delete(`http://localhost:3000/playlist/${selectedItem.id}`);
      // Refresh the wishlist items
      const response = await axios.get('http://localhost:3000/playlist');
      setPlaylist(response.data);
    } catch (error) {
      console.error('Error removing item from wishlist: ', error);
    }
  };
  
  const isItemInPlaylist = (itemId) => {
    return playlist.some((item) => item.itemId === itemId);
  };


  const filteredItems = items.filter((item) => {
    const lowerCaseQuery = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(lowerCaseQuery) ||
      item.singer.toLowerCase().includes(lowerCaseQuery) ||
      item.genre.toLowerCase().includes(lowerCaseQuery)
    );
  });


    return (
      <div className="songs-container" style={{marginLeft: '250px', padding: '30px', minHeight: '100vh'}}>
        <div className="container-fluid">
          <h2 className="text-4xl font-bold mb-8 text-center text-white" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>
            Songs List
          </h2>
          
          <div className="search-container mb-6" style={{maxWidth: '600px', margin: '0 auto 40px auto'}}>
            <InputGroup className="search-input-group">
              <InputGroup.Text id="search-icon" style={{background: 'white', border: 'none', borderRadius: '25px 0 0 25px'}}>
                <FaSearch color="#666" />
              </InputGroup.Text>
              <Form.Control
                type="search"
                placeholder="Search by singer, genre, or song name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  borderRadius: '0 25px 25px 0',
                  padding: '15px 20px',
                  fontSize: '16px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}
              />
            </InputGroup>
          </div>

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {filteredItems.map((item, index) => (
              <div key={item.id} className="col">
                <div className="song-card" style={{
                  background: 'white',
                  borderRadius: '15px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div className="image-container" style={{position: 'relative', height: '200px', overflow: 'hidden'}}>
                    <img
                      src={item.imgUrl}
                      alt="Song Cover"
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(0,0,0,0.7)',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}>
                      {isItemInWishlist(item.id) ? (
                        <FaHeart 
                          color="red" 
                          size={20}
                          onClick={() => removeFromWishlist(item.id)}
                        />
                      ) : (
                        <FaRegHeart 
                          color="white" 
                          size={20}
                          onClick={() => addToWishlist(item.id)}
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="card-content" style={{padding: '20px', flex: 1, display: 'flex', flexDirection: 'column'}}>
                    <h5 className="song-title" style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      marginBottom: '8px',
                      color: '#333',
                      lineHeight: '1.3'
                    }}>
                      {item.title}
                    </h5>
                    
                    <p className="song-info" style={{
                      color: '#666',
                      fontSize: '14px',
                      marginBottom: '4px'
                    }}>
                      <strong>Genre:</strong> {item.genre}
                    </p>
                    
                    <p className="song-info" style={{
                      color: '#666',
                      fontSize: '14px',
                      marginBottom: '15px'
                    }}>
                      <strong>Singer:</strong> {item.singer}
                    </p>
                    
                    <div className="audio-container" style={{marginBottom: '15px'}}>
                      <audio 
                        controls 
                        className="w-100" 
                        id={`audio-${item.id}`}
                        style={{
                          width: '100%',
                          height: '40px',
                          borderRadius: '20px'
                        }}
                      >
                        <source src={item.songUrl} />
                      </audio>
                    </div>
                    
                    <div className="playlist-button" style={{marginTop: 'auto'}}>
                      {isItemInPlaylist(item.id) ? (
                        <Button
                          variant="outline-danger"
                          onClick={() => removeFromPlaylist(item.id)}
                          style={{
                            width: '100%',
                            borderRadius: '25px',
                            padding: '10px',
                            fontWeight: '500',
                            border: '2px solid #dc3545',
                            color: '#dc3545',
                            background: 'transparent',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = '#dc3545';
                            e.target.style.color = 'white';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.color = '#dc3545';
                          }}
                        >
                          Remove From Playlist
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={() => addToPlaylist(item.id)}
                          style={{
                            width: '100%',
                            borderRadius: '25px',
                            padding: '10px',
                            fontWeight: '500',
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            border: 'none',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          Add to Playlist
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

export default Songs;
