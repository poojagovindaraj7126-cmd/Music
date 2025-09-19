import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table } from 'react-bootstrap';
import { FaPauseCircle, FaPlayCircle } from 'react-icons/fa';

function Playlist() {
  const [playlist, setPlaylist] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {

      axios
        .get(`http://localhost:3000/playlist`)
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

 

  const removeFromPlaylist = async (itemId) => {
    try {
      // Find the item in the wishlist by itemId
      const selectedItem = playlist.find((item) => item.itemId === itemId);
      if (!selectedItem) {
        throw new Error('Selected item not found in playlist');
      }
      // Make a DELETE request to remove the item from the wishlist
      await axios.delete(`http://localhost:3000/playlist/${selectedItem.id}`);
      // Refresh the wishlist items
      const response = await axios.get('http://localhost:3000/playlist');
      setPlaylist(response.data);
    } catch (error) {
      console.error('Error removing item from playlist: ', error);
    }
  };
  

  const playAllSongs = () => {
    if (playlist.length === 0) return;
    
    const currentSongAudio = document.getElementById(`audio-${playlist[0].id}`);
    if (!currentSongAudio) return;

    if (currentSongAudio.paused) {
      // Start playing from the first song
      currentSongAudio.play();
      setIsPlaying(true);
      
      // Set up the event listener to play the next song when the current one ends
      const playNextSong = (currentIndex) => {
        const nextIndex = (currentIndex + 1) % playlist.length;
        const nextSongAudio = document.getElementById(`audio-${playlist[nextIndex].id}`);
        
        if (nextSongAudio) {
          nextSongAudio.play();
        }
      };
      
      currentSongAudio.addEventListener('ended', () => {
        const currentIndex = playlist.findIndex(item => item.id === playlist[0].id);
        playNextSong(currentIndex);
      });
    } else {
      // Pause the currently playing audio
      currentSongAudio.pause();
      setIsPlaying(false);
    }
  };
  
  return (
    <div style={{marginLeft: '250px', padding: '30px', minHeight: '100vh'}}>
      <div className="container-fluid">
        <h2 className="text-4xl font-bold mb-8 text-center text-white" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>
          Playlist
        </h2>
         
          <div className="playlist-table-container" style={{
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
                <th style={{border: 'none', padding: '20px 15px', fontWeight: '600'}}>Actions</th>
                <th style={{border: 'none', padding: '20px 15px', fontWeight: '600', textAlign: 'center'}}>
                  <Button
                    style={{ 
                      background: 'rgba(255,255,255,0.2)', 
                      border: '2px solid rgba(255,255,255,0.3)', 
                      borderRadius: '25px',
                      padding: '8px 20px',
                      color: 'white',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={playAllSongs}
                    onMouseOver={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.3)';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.2)';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    {isPlaying ? <FaPauseCircle size={20} /> : <FaPlayCircle size={20} />}
                    <span style={{marginLeft: '8px'}}>{isPlaying ? 'Pause All' : 'Play All'}</span>
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {playlist.map((item, index) => (
                <tr key={item.id} style={{borderBottom: '1px solid #f0f0f0'}}>
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
                  <td style={{padding: '20px 15px'}}>
                    <audio 
                      controls 
                      id={`audio-${item.id}`} 
                      style={{ 
                        width: '280px',
                        height: '40px',
                        borderRadius: '20px'
                      }}
                    >
                      <source src={item.songUrl} />
                    </audio>
                  </td>
                  <td style={{padding: '20px 15px', textAlign: 'center'}}>
                    <Button
                      style={{ 
                        background: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
                        border: 'none',
                        borderRadius: '25px',
                        padding: '8px 20px',
                        color: 'white',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => removeFromPlaylist(item.itemId)}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.boxShadow = '0 5px 15px rgba(255,107,107,0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      Remove
                    </Button>
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

export default Playlist;
