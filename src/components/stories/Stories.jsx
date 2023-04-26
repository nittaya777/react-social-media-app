import { useContext, useState } from "react";
import "./stories.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const Stories = () => {
  const { currentUser } = useContext(AuthContext);
  const [openUpload, setOpenUpload] = useState(false);
  const [storyImg, setStoryImg] = useState(null);

  const { isLoading, error, data } = useQuery(["stories"], () =>
    makeRequest.get("/stories").then((res) => {
      return res.data;
    })
  );
  const upload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const queryClient = useQueryClient();
  const mutation = useMutation(
    (story) => {
      return makeRequest.post("/stories", story);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["stories"]);
      },
    }
  );
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storyImg) return false;
    let img = await upload(storyImg);
    mutation.mutate({ img });
    setOpenUpload(false)
    setStoryImg(null)
  };

  return (
    <>
      <div className="stories">
        <div className="story">
          <img src={`/upload/${currentUser.profilePicture}`} alt="" />
          <span>{currentUser.name}</span>
          <button onClick={() => setOpenUpload(!openUpload)}>+</button>
        </div>
        {error
          ? "Something went wrong"
          : isLoading
          ? "loading"
          : data.length>0 && data.map((story) => (
              <div className="story" key={story.id}>
                <img src={`/upload/${story.img}`} alt="" />
                <span>{story.name}</span>
              </div>
            ))}
      </div>
      {openUpload && (
        <div className="story-upload">
          <div className="wrapper">
            <form>
              <h1>Add Your Story</h1>
              <label htmlFor="storyImage">
                <div className="imgContainer">
                  <img src={storyImg && URL.createObjectURL(storyImg)} alt="" />
                  <CloudUploadIcon className="icon" />
                </div>
              </label>
              <input
                type="file"
                id="storyImage"
                style={{ display: "none" }}
                onChange={(e) => setStoryImg(e.target.files[0])}
              />
              <button
                onClick={handleSubmit}
                disabled={storyImg ? null : "disabled"}
              >
                Upload
              </button>
            </form>
            <button className="close" onClick={() => setOpenUpload(false)}>
              x
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Stories;
