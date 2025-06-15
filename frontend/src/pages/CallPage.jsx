import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
  useCall,
  Call,
} from "@stream-io/video-react-sdk";


import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../compnents/PageLoader";
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY; // Ensure this is set in your environment variables

const CallPage = () => {
  const {id: callId} = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  
  const {authUser} = useAuthUser();

  const {data: tokenData} = useQuery({
    queryKey: ['streamToken'],
    queryFn: getStreamToken,
    enabled: !!authUser
  });

  useEffect(() => {
    const initCall = async () => {
      if(!tokenData.token || !authUser || !callId) {
        return;
      }
      try {
        console.log("Initializing call client with token:", tokenData.token);

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic
        }

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY, 
          user,
          token: tokenData.token,
        })

        const callInstance = videoClient.call("default",callId);

        await callInstance.join({create: true});
        console.log("joined call:", callId);
        
        setClient(videoClient);
        setCall(callInstance);
        
      } catch (error) {
        console.log("Error initializing call client:", error);
        toast.error("Failed to initialize call. Please try again later.");
      }
      finally{
        setIsConnecting(false);
      }
    }
    initCall();
  },[tokenData, authUser, callId]);

  if(isConnecting || !client || !call)  return <PageLoader/>
  return (
    <div className="h-screen flex flex-col items-center justify-center ">
      <div className="relative">
        {
          client && call ? (
            <StreamVideo client={client}>
              <StreamCall call = {call}>
                <CallContent/>
              </StreamCall>
            </StreamVideo>
          ):(
            <div className="flex items-center justify-center h-full">
              Cannot initaialize call. Please try again later.
              </div>
          )

        }
      </div>
    </div>
  )
}

const CallContent = () => {
  const {useCallCallingState} = useCallStateHooks();
  const callingState = useCallCallingState();

  const navigete = useNavigate();

  if(callingState === CallingState.LEFT) return navigete('/');
  return (
    <StreamTheme>
      <SpeakerLayout/>
      <CallControls/>
    </StreamTheme>
  )
}

export default CallPage