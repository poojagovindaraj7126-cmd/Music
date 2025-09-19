import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table } from 'react-bootstrap';
import { FaHeart } from 'react-icons/fa';

function Favorities() {
  const [playlist, setPlaylist] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  useEffect(() => {

      axios
        .get(`http://localhost:3000/favorities`)
        .then((response) => {
          const playlistData = response.data;
          setPlaylist(playlistData);
        })
        .catch((error) => {
          console.error('Error fetching playlist items: ', error);
        });
    

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
    playlist.forEach((item) => {
      const audioElement = document.getElementById(`audio-${item.id}`);
      if (audioElement) {
        handlePlay(item.id, audioElement);
      }
    });

    // Cleanup event listeners
    return () => {
      playlist.forEach((item) => {
        const audioElement = document.getElementById(`audio-${item.id}`);
        if (audioElement) {
          audioElement.removeEventListener('play', () => handleAudioPlay(item.id, audioElement));
        }
      });
    };
  }, [playlist, currentlyPlaying]);

 

  const removeFromFavorites = async (itemId) => {
    try {
      // Find the item in the wishlist by itemId
      const selectedItem = playlist.find((item) => item.itemId === itemId);
      if (!selectedItem) {
        throw new Error('Selected item not found in favorites');
      }
      // Make a DELETE request to remove the item from the wishlist
      await axios.delete(`http://localhost:3000/favorities/${selectedItem.id}`);
      // Refresh the wishlist items
      const response = await axios.get('http://localhost:3000/favorities');
      setPlaylist(response.data);
    } catch (error) {
      console.error('Error removing item from favorites: ', error);
    }
  };
  

  
  
  return (
    <div style={{marginLeft: '250px', padding: '30px', minHeight: '100vh'}}>
      <div className="container-fluid">
        <h2 className="text-4xl font-bold mb-8 text-center text-white" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>
          Favorites
        </h2>
       
        <div className="favorites-table-container" style={{
          background: 'white',
          borderRadius: '15px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          overflow: 'hidden'
        }}>
          <Table responsive className="mb-0">

            <thead style={{background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white'}}>
              <tr>
                <th style={{border: 'none', padding: '20px 15px', fontWeight: '600'}}>#</th>
                <th style={{border: 'none', padding: '20px 15px', fontWeight: '600'}}>Title</th>
                <th style={{border: 'none', padding: '20px 15px', fontWeight: '600'}}>Genre</th>
                <th style={{border: 'none', padding: '20px 15px', fontWeight: '600'}}>Favorite</th>
                <th style={{border: 'none', padding: '20px 15px', fontWeight: '600'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {playlist.map((item, index) => (
                <tr key={item._id} style={{borderBottom: '1px solid #f0f0f0'}}>
                  <td style={{padding: '20px 15px', fontWeight: '500', color: '#666'}}>{index + 1}</td>
                  <td style={{padding: '20px 15px'}}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img
                        src={item.imgUrl}
                        alt="Song Cover"
                        className="rounded"
                        style={{ 
                          height: '60px', 
                          width: '60px', 
                          objectFit: 'cover',
                          borderRadius: '8px',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                      <div style={{ paddingLeft: '20px' }}>
                        <strong style={{fontSize: '16px', color: '#333'}}>{item.title}</strong>
                        <p style={{margin: '5px 0 0 0', color: '#666', fontSize: '14px'}}>{item.singer}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{padding: '20px 15px', color: '#666'}}>
                    <span style={{
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '15px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {item.genre}
                    </span>
                  </td>
                  <td style={{padding: '20px 15px', textAlign: 'center'}}>
                    <Button
                      style={{ 
                        backgroundColor: 'transparent', 
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => removeFromFavorites(item.itemId)}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#ffebee';
                        e.target.style.transform = 'scale(1.1)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      <FaHeart color="red" size={20} />
                    </Button>
                  </td>
                  <td style={{padding: '20px 15px'}}>
                    <audio 
                      controls 
                      id={`audio-${item.id}`} 
                      style={{ 
                        width: '250px',
                        height: '40px',
                        borderRadius: '20px'
                      }}
                    >
                      <source src={item.songUrl} />
                    </audio>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default Favorities;
