import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript";

const InterviewRoom = ({ roomId }) => {
  const [code, setCode] = useState("// Start coding...");
  const [editorWidth, setEditorWidth] = useState(50);

  const socketRef = useRef(null);
  const localVideo = useRef();
  const remoteVideo = useRef();
  const peerConnection = useRef(null);
  const localStream = useRef(null);

  const [micMuted, setMicMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [audioOnly, setAudioOnly] = useState(false);

  const servers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    const socket = io("https://interview-prep-platform-07wl.onrender.com");
    socketRef.current = socket;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStream.current = stream;
        if (localVideo.current) localVideo.current.srcObject = stream;

        if (micMuted) {
          stream.getAudioTracks().forEach((track) => (track.enabled = false));
        }

        socket.emit("join-room", roomId);

        socket.on("initial-code", ({ code: initialCode }) => {
          if (initialCode) setCode(initialCode);
        });

        socket.on("code-change", ({ code: incomingCode }) => {
          if (incomingCode !== code) setCode(incomingCode);
        });

        socket.on("peer-connected", async () => {
          if (!peerConnection.current) createPeerConnection();
          const offer = await peerConnection.current.createOffer();
          await peerConnection.current.setLocalDescription(offer);
          socket.emit("signal", { roomId, signalData: { sdp: offer } });
        });

        socket.on("signal", async ({ signalData }) => {
          if (!peerConnection.current) createPeerConnection();

          if (signalData.sdp) {
            await peerConnection.current.setRemoteDescription(
              new RTCSessionDescription(signalData.sdp)
            );
            if (signalData.sdp.type === "offer") {
              const answer = await peerConnection.current.createAnswer();
              await peerConnection.current.setLocalDescription(answer);
              socket.emit("signal", { roomId, signalData: { sdp: answer } });
            }
          }

          if (signalData.candidate) {
            try {
              await peerConnection.current.addIceCandidate(
                new RTCIceCandidate(signalData.candidate)
              );
            } catch (err) {
              console.error("Error adding ice candidate", err);
            }
          }
        });
      });

    return () => {
      socket.disconnect();
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [roomId, micMuted]);

  const createPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection(servers);

    localStream.current.getTracks().forEach((track) =>
      peerConnection.current.addTrack(track, localStream.current)
    );

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("signal", {
          roomId,
          signalData: { candidate: event.candidate },
        });
      }
    };

    peerConnection.current.ontrack = (event) => {
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = event.streams[0];
        remoteVideo.current.volume = volume;
        remoteVideo.current.muted = false;
        remoteVideo.current.play().catch(console.error);
      }
    };
  };

  useEffect(() => {
    if (remoteVideo.current) {
      remoteVideo.current.volume = volume;
    }
  }, [volume]);

  const toggleMute = () => {
    const enabled = micMuted;
    setMicMuted(!enabled);
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  };

  const handleResize = (e) => {
    const percent = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
    if (percent > 20 && percent < 80) setEditorWidth(percent);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "sans-serif",
      }}
    >
      {/* Left: Video Section */}
      <div
        style={{
          width: `${100 - editorWidth}%`,
          display: "flex",
          flexDirection: "column",
          background: "#222",
        }}
      >
        {[{ ref: localVideo, label: "You" }, { ref: remoteVideo, label: "Peer" }].map(
          ({ ref, label }, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                margin: "5px",
                background: "#111",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              {!audioOnly && (
                <video
                  ref={ref}
                  autoPlay
                  playsInline
                  muted={label === "You"}
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#000",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
          )
        )}
        <div style={{ padding: "10px", textAlign: "center" }}>
          <button onClick={toggleMute} style={{ marginRight: "10px" }}>
            {micMuted ? "Unmute Mic" : "Mute Mic"}
          </button>

          <label style={{ marginRight: "10px" }}>
            Remote Volume:
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
          </label>

          <button onClick={() => setAudioOnly((prev) => !prev)}>
            {audioOnly ? "Show Video" : "Audio Only"}
          </button>
        </div>
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={() => {
          const onMouseMove = (e) => handleResize(e);
          const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
          };
          window.addEventListener("mousemove", onMouseMove);
          window.addEventListener("mouseup", onMouseUp);
        }}
        style={{
          width: "5px",
          cursor: "ew-resize",
          background: "#555",
        }}
      />

      {/* Right: Code Editor */}
      <div
        style={{
          width: `${editorWidth}%`,
          background: "#1e1e1e",
          color: "#fff",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CodeMirror
          value={code}
          options={{
            mode: "javascript",
            theme: "material",
            lineNumbers: true,
          }}
          onBeforeChange={(editor, data, value) => {
            setCode(value);
            socketRef.current?.emit("code-change", { roomId, code: value });
          }}
          editorDidMount={(editor) => {
            editor.setSize("100%", "100%");
          }}
        />
      </div>
    </div>
  );
};

export default InterviewRoom;
