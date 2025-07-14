import React from 'react';
import { useParams } from 'react-router-dom';
import InterviewRoom from '../components/interviewroom';
import CodeEditor from './codeeditor';

const RoomPage = () => {
  const { roomId } = useParams();

  return (
    <div>
      <InterviewRoom roomId={roomId} />
      
    </div>
  );
};

export default RoomPage;
