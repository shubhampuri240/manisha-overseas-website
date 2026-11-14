(()=>{"use strict";
const params=new URLSearchParams(location.search),rawImage=params.get("image"),styleCode=params.get("style"),rawName=params.get("name")||(styleCode?"Style "+styleCode:"Selected website garment");
let garmentImageUrl=null;
if(rawImage){try{const u=new URL(rawImage,location.href);if(u.protocol==="https:"||u.origin===location.origin)garmentImageUrl=u.href;}catch(e){}}
if(!garmentImageUrl&&styleCode&&window.MANISHA_CATALOGUE_IMAGES?.[styleCode])garmentImageUrl=window.MANISHA_CATALOGUE_IMAGES[styleCode].front;
const frame=document.querySelector("#photo-reference-frame"),caption=document.querySelector("#photo-style-caption"),title=document.querySelector("#stage-style-title"),statusLine=document.querySelector("#stage-status");
if(garmentImageUrl&&frame){
 const applyWebsiteReference=()=>{frame.style.backgroundImage="url("+JSON.stringify(garmentImageUrl)+")";};
 applyWebsiteReference();
 const referenceObserver=new MutationObserver(()=>{if(!frame.style.backgroundImage.includes(garmentImageUrl))applyWebsiteReference();});
 referenceObserver.observe(frame,{attributes:true,attributeFilter:["style"]});frame.style.backgroundSize="contain";frame.style.backgroundPosition="center";frame.style.backgroundRepeat="no-repeat";frame.style.backgroundColor="#f1ece2";
 if(caption)caption.textContent="WEBSITE SELECTION / "+rawName.toUpperCase();
 if(title)title.textContent="Website selection · "+rawName;
 if(statusLine)statusLine.textContent="Website garment selected · switch to Catalogue photo to inspect";
}
const rail=document.querySelector(".studio-right-rail");if(!rail)return;
const panel=document.createElement("section");panel.className="studio-panel studio-tryon-panel";
panel.innerHTML='<div class="panel-heading"><span>05 / VIRTUAL TRY-ON</span><b>See it on you</b><small>Use a photo you own or have permission to use.</small></div>'+
'<div class="tryon-garment-reference"><img id="tryon-garment-thumb" alt=""><div><span>SELECTED GARMENT</span><b id="tryon-garment-name">No website garment selected</b></div></div>'+
'<label class="tryon-upload-label" for="studio-person-photo"><span class="tryon-upload-icon">＋</span><span><b>Upload your photo</b><small>JPG, PNG or WebP · max 10 MB</small></span></label>'+
'<input id="studio-person-photo" type="file" accept="image/jpeg,image/png,image/webp" hidden>'+
'<div id="tryon-person-preview" class="tryon-person-preview" hidden><img id="tryon-person-image" alt="Your selected photo"><span id="tryon-file-name"></span><button id="tryon-clear-photo" type="button" aria-label="Remove uploaded photo">×</button></div>'+
'<label class="tryon-consent"><input id="tryon-consent-check" type="checkbox"><span>I confirm this is my photo or I have the person’s permission to use it for virtual try-on.</span></label>'+
'<button id="tryon-submit" type="button" class="tryon-submit" disabled>Try this dress on my photo ↗</button>'+
'<p id="tryon-status" class="tryon-status" role="status">Choose a garment photo from the website, upload your own photo and confirm consent.</p>'+
'<div id="tryon-result" class="tryon-result" hidden><img id="tryon-result-image" alt="Virtual try-on preview"><a id="tryon-download" download="manisha-virtual-tryon.jpg">Save result ↓</a></div>'+
'<p class="tryon-privacy">Your photo is sent only after you press Try-on. It is not saved in this website gallery. The try-on service processes it; see its <a href="https://docs.fashn.ai/api-overview/data-retention-privacy" target="_blank" rel="noopener">data retention details</a>. Results are previews, not fit or sizing guarantees.</p>';
rail.appendChild(panel);
const $=s=>panel.querySelector(s),personInput=$("#studio-person-photo"),personPreview=$("#tryon-person-preview"),personImage=$("#tryon-person-image"),fileName=$("#tryon-file-name"),consent=$("#tryon-consent-check"),submit=$("#tryon-submit"),status=$("#tryon-status"),resultBox=$("#tryon-result"),resultImage=$("#tryon-result-image"),download=$("#tryon-download");
const garmentThumb=$("#tryon-garment-thumb"),garmentName=$("#tryon-garment-name");
if(garmentImageUrl){garmentThumb.src=garmentImageUrl;garmentName.textContent=rawName;}else{garmentThumb.hidden=true;garmentName.textContent="Open a product photo from a collection page first.";}
let personFile=null,previewUrl=null,busy=false,csrfToken=null;
function setStatus(message,error=false){status.textContent=message;status.classList.toggle("is-error",error);}
function validate(){submit.disabled=busy||!personFile||!consent.checked||!garmentImageUrl;}
personInput.addEventListener("change",()=>{
 const file=personInput.files&&personInput.files[0];if(!file){personFile=null;validate();return;}
 if(!["image/jpeg","image/png","image/webp"].includes(file.type)){setStatus("Choose a JPG, PNG or WebP image.",true);personInput.value="";return;}
 if(file.size>10*1024*1024){setStatus("That image is larger than 10 MB. Choose a smaller photo.",true);personInput.value="";return;}
 personFile=file;if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=URL.createObjectURL(file);personImage.src=previewUrl;fileName.textContent=file.name;personPreview.hidden=false;resultBox.hidden=true;setStatus("Photo ready. Confirm consent, then start the try-on.");validate();
});
consent.addEventListener("change",validate);
$("#tryon-clear-photo").addEventListener("click",()=>{personFile=null;personInput.value="";personPreview.hidden=true;personImage.removeAttribute("src");if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=null;validate();setStatus("Photo removed.");});
async function imageAsDataUri(url){const response=await fetch(url,{mode:"cors",credentials:"omit"});if(!response.ok)throw new Error("The selected garment image could not be loaded.");const blob=await response.blob();if(!blob.type.startsWith("image/"))throw new Error("The selected garment reference is not an image.");return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error("Could not prepare garment image."));reader.readAsDataURL(blob);});}
async function getCsrfToken(){const response=await fetch("try-on-api.php?action=token",{credentials:"same-origin",cache:"no-store"});const data=await response.json().catch(()=>({message:"Could not initialise the secure try-on session."}));if(!response.ok||!data.csrf_token)throw new Error(data.message||"Could not initialise the secure try-on session.");return data.csrf_token;}
async function poll(id){for(let i=0;i<45;i++){await new Promise(resolve=>setTimeout(resolve,2000));const form=new FormData();form.append("action","status");form.append("csrf_token",csrfToken);form.append("id",id);const response=await fetch("try-on-api.php",{method:"POST",body:form,credentials:"same-origin"});const data=await response.json().catch(()=>({message:"Try-on service returned an unreadable response."}));if(!response.ok)throw new Error(data.message||"Try-on status could not be checked.");if(data.status==="completed")return data.output;if(data.status==="failed")throw new Error(data.message||"The try-on could not be generated.");setStatus("Creating your preview… "+((i+1)*2)+"s");}throw new Error("This try-on took too long. Try again with a clear, front-facing photo.");}
submit.addEventListener("click",async()=>{
 if(busy)return;if(!personFile||!consent.checked||!garmentImageUrl){setStatus("Select a website garment, upload a photo and confirm permission first.",true);return;}
 busy=true;validate();resultBox.hidden=true;setStatus("Preparing your garment and photo…");
 try{
  csrfToken=await getCsrfToken();const garmentData=await imageAsDataUri(garmentImageUrl),form=new FormData();form.append("action","run");form.append("csrf_token",csrfToken);form.append("person_photo",personFile);form.append("garment_image",garmentData);
  const response=await fetch("try-on-api.php",{method:"POST",body:form,credentials:"same-origin"}),data=await response.json().catch(()=>({message:"The try-on endpoint is not responding as a configured service."}));
  if(!response.ok)throw new Error(data.message||"The try-on service is not configured on this website host.");if(!data.id)throw new Error("The try-on service did not return a prediction ID.");
  setStatus("Your try-on is processing…");const output=await poll(data.id),rawImage=Array.isArray(output)?output[0]:output;if(!rawImage||typeof rawImage!=="string")throw new Error("The try-on service returned no image.");const image=(rawImage.startsWith("data:image/")||rawImage.startsWith("https://"))?rawImage:"data:image/jpeg;base64,"+rawImage;
  resultImage.src=image;download.href=image;resultBox.hidden=false;setStatus("Your virtual try-on preview is ready.");
 }catch(error){setStatus(error.message+" The current GitHub Pages preview cannot run PHP; enable the backend on PHP hosting first.",true);}
 finally{busy=false;validate();}
});
})();