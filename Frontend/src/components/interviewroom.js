// src/components/interviewroom.js
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const InterviewRoom = ({ roomId }) => {
  const [socket, setSocket] = useState(null);
  const localVideo = useRef();
  const remoteVideo = useRef();
  const peerConnection = useRef(null);
  const localStream = useRef(null);

  const servers = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  useEffect(() => {
    const s = io('http://localhost:5000');
    setSocket(s);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      localVideo.current.srcObject = stream;
      localStream.current = stream;

      s.emit('join-room', roomId);

      s.on('peer-connected', async () => {
        peerConnection.current = new RTCPeerConnection(servers);

        localStream.current.getTracks().forEach(track =>
          peerConnection.current.addTrack(track, localStream.current)
        );

        peerConnection.current.onicecandidate = event => {
          if (event.candidate) {
            s.emit('signal', { roomId, signalData: { candidate: event.candidate } });
          }
        };

        peerConnection.current.ontrack = event => {
          remoteVideo.current.srcObject = event.streams[0];
        };

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        s.emit('signal', { roomId, signalData: { sdp: offer } });
      });

      s.on('signal', async ({ signalData }) => {
        if (!peerConnection.current) {
          peerConnection.current = new RTCPeerConnection(servers);

          localStream.current.getTracks().forEach(track =>
            peerConnection.current.addTrack(track, localStream.current)
          );

          peerConnection.current.onicecandidate = event => {
            if (event.candidate) {
              s.emit('signal', { roomId, signalData: { candidate: event.candidate } });
            }
          };

          peerConnection.current.ontrack = event => {
            remoteVideo.current.srcObject = event.streams[0];
          };
        }

        if (signalData.sdp) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
          if (signalData.sdp.type === 'offer') {
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            s.emit('signal', { roomId, signalData: { sdp: answer } });
          }
        }

        if (signalData.candidate) {
          try {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(signalData.candidate));
          } catch (err) {
            console.error('Error adding received ice candidate', err);
          }
        }
      });
    });

    return () => {
      s.disconnect();
    };
  }, [roomId]);

  return (
    <div>
      <h2>Interview Room: {roomId}</h2>
      <div style={{ display: 'flex', gap: '20px' }}>
        <video ref={localVideo} autoPlay muted style={{ width: '300px' }} />
        <video ref={remoteVideo} autoPlay style={{ width: '300px' }} />
      </div>
    </div>
  );
};

export default InterviewRoom;
