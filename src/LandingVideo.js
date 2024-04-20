// import React from 'react';
// import { Link } from "react-router-dom";
// import ReactPlayer from 'react-player';
// import './styles.css';

// export default function Landing() {
//   return (
//     <div className="Logo" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', overflow: 'hidden' }}>
//       <div className="animated-video-box">
//         <Link to="/Products" style={{ display: 'block', width: '100%' }}>
//           <ReactPlayer
//             url='https://streamable.com/gwbh8h' // Path to your video
//             playing={false}
//             loop={true}
//             width='100%'
//             height='100%'
//             controls={false}
//             muted={true}
//             onReady={() => console.log('Player is ready')}
//             onMouseEnter={e => e.target.play()}
//             onMouseLeave={e => e.target.pause()}
//             onClick={() => window.location.href = '/Products'}
//             config={{
//               file: {
//                 attributes: {
//                   poster: 'src/logo.png' // Path to your static image poster
//                 }
//               }
//             }}
//           />
//         </Link>
//       </div>
//     </div>
//   );
// }
