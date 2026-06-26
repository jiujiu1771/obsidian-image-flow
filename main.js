/* Built-in Image Flow image manager. Bundled as a single-file Obsidian plugin; no external plugin is required. */
/* Image manager code is vendored into Image Flow and patched only for Image Flow view id and copy embed action. */
var w=require("obsidian");var fe=require("obsidian");var D=["png","jpg","jpeg","gif","bmp","webp","svg","ico","tif","tiff","avif","heic","heif"];var z=class{constructor(a){this.app=a;this.customFileTypes=[];this.excludedFolders=[]}setCustomFileTypes(a){this.customFileTypes=a.filter(e=>e.fileExtension&&e.coverExtension)}setExcludedFolders(a){this.excludedFolders=a.map(e=>e.trim()).filter(e=>e.length>0)}loadImages(a){let e=this.app.vault.getFiles(),t=new Set;return this.customFileTypes.forEach(n=>{e.filter(o=>o.extension.toLowerCase()===n.fileExtension.toLowerCase()).forEach(o=>{let l=this.getCoverPath(o.path,n);t.add(l)})}),e.filter(n=>{for(let m of this.excludedFolders)if(n.path.startsWith(m+"/")||n.path===m)return!1;let r=!0;a&&a.trim()!==""&&(r=n.path.startsWith(a+"/")||n.path===a);let o=n.extension.toLowerCase(),l=D.includes(o),c=this.customFileTypes.some(m=>m.fileExtension.toLowerCase()===o);return t.has(n.path)?!1:r&&(l||c)}).map(n=>this.processImageFile(n))}processImageFile(a){let e=a.extension.toLowerCase(),t=a,i=!1,s,n=!1,r=this.customFileTypes.find(o=>o.fileExtension.toLowerCase()===e);if(r){i=!0,s=r;let o=this.getCoverPath(a.path,r),l=this.app.vault.getAbstractFileByPath(o);l instanceof fe.TFile?t=l:n=!0}return{name:a.name,path:a.path,originalFile:a,displayFile:t,isCustomType:i,customTypeConfig:s,coverMissing:n,stat:{ctime:a.stat.ctime,mtime:a.stat.mtime,size:a.stat.size}}}getCoverPath(a,e){let t=a.substring(0,a.lastIndexOf("/")),i=a.substring(a.lastIndexOf("/")+1),s=i.substring(0,i.lastIndexOf(".")),n=t;return e.coverFolder&&e.coverFolder.trim()!==""&&(n=e.coverFolder.startsWith("/")?e.coverFolder.substring(1):t+"/"+e.coverFolder),`${n}/${s}.${e.coverExtension}`}getImageResourcePath(a){return this.app.vault.getResourcePath(a)}};var ve=require("obsidian");var X=class{constructor(){this.cache=new Map}get(a){return this.cache.get(a)}set(a,e){this.cache.set(a,e)}has(a){return this.cache.has(a)}delete(a){this.cache.delete(a)}clear(){this.cache.clear()}get size(){return this.cache.size}updateKey(a,e){let t=this.cache.get(a);t&&(this.cache.delete(a),this.cache.set(e,t))}};var Y=class{constructor(a){this.app=a;this.referenceCache=new X}async checkReferences(a,e){if(a.length===0)return a;try{let t=[...a],i=0;for(let s=0;s<t.length;s++){let n=t[s],r=n.path;if(this.referenceCache.has(r)){let o=this.referenceCache.get(r);t[s]={...n,references:o.references,referenceCount:o.referenceCount}}else{let o=this.findReferencesUsingBacklinks(n),l={references:o,referenceCount:o.length};this.referenceCache.set(r,l),t[s]={...n,...l}}i++,e&&i%10===0&&(e(i,t.length),await new Promise(o=>window.setTimeout(o,0)))}return e&&i>0&&e(i,t.length),t}catch(t){throw t}}findReferencesUsingBacklinks(a){let e=[],t=a.originalFile;a.isCustomType&&a.displayFile!==a.originalFile&&(t=a.displayFile);let i=this.app.metadataCache.getBacklinksForFile(t);if(!i||!i.data)return e;for(let[s,n]of i.data){let r=this.app.vault.getAbstractFileByPath(s);if(r instanceof ve.TFile)for(let o of n){let l=o.link?.startsWith("!");e.push({file:r,type:l?"embed":"link",position:o.position})}}return e}clearCache(){this.referenceCache.clear()}getCache(){return this.referenceCache}};var L=require("obsidian");var Q=class{constructor(a){this.app=a}openFile(a){let e=a.originalFile.extension.toLowerCase();D.includes(e)?this.app.openWithDefaultApp(a.originalFile.path):this.app.workspace.getLeaf(!1).openFile(a.originalFile)}async renameFile(a,e){try{let t=a.path.replace(/[^/]+$/,e);if(await this.app.fileManager.renameFile(a.originalFile,t),a.isCustomType&&a.customTypeConfig){let i=this.getCoverPath(a.path,a.customTypeConfig),s=this.app.vault.getAbstractFileByPath(i);if(s instanceof L.TFile){let n=this.getCoverPath(t,a.customTypeConfig);await this.app.fileManager.renameFile(s,n)}}new L.Notice("\u6587\u4EF6\u91CD\u547D\u540D\u6210\u529F")}catch(t){throw new L.Notice(`\u91CD\u547D\u540D\u5931\u8D25: ${t instanceof Error?t.message:String(t)}`),t}}async deleteFile(a,e=!1){try{if(await this.app.fileManager.trashFile(a.originalFile),a.isCustomType&&a.customTypeConfig){let t=this.getCoverPath(a.path,a.customTypeConfig),i=this.app.vault.getAbstractFileByPath(t);i instanceof L.TFile&&await this.app.fileManager.trashFile(i)}e||new L.Notice("\u6587\u4EF6\u5220\u9664\u6210\u529F")}catch(t){throw e||new L.Notice(`\u5220\u9664\u5931\u8D25: ${t instanceof Error?t.message:String(t)}`),t}}getDeleteExtraMessage(a){return a.isCustomType&&a.customTypeConfig?`\u540C\u65F6\u4F1A\u5220\u9664\u5BF9\u5E94\u7684 ${a.customTypeConfig.coverExtension.toUpperCase()} \u5C01\u9762\u6587\u4EF6`:""}async moveFile(a,e,t=!1){try{let i=e?`${e}/${a.originalFile.name}`:a.originalFile.name;if(i===a.originalFile.path)return t||new L.Notice("\u6587\u4EF6\u5DF2\u5728\u8BE5\u6587\u4EF6\u5939\u4E2D"),null;if(await this.app.fileManager.renameFile(a.originalFile,i),a.isCustomType&&a.customTypeConfig){let s=this.getCoverPath(a.path,a.customTypeConfig),n=this.app.vault.getAbstractFileByPath(s);if(n instanceof L.TFile){let r=this.getCoverPath(i,a.customTypeConfig);await this.app.fileManager.renameFile(n,r)}}return t||new L.Notice("\u6587\u4EF6\u79FB\u52A8\u6210\u529F"),i}catch(i){throw t||new L.Notice(`\u79FB\u52A8\u5931\u8D25: ${i instanceof Error?i.message:String(i)}`),i}}async openReferenceFile(a,e){let t=this.app.vault.getAbstractFileByPath(a);if(t instanceof L.TFile){let i=this.app.workspace.getLeaf(!1);if(await i.openFile(t),e){let s=e.start.line;i.setEphemeralState({line:s});let n=i.view;n instanceof L.MarkdownView&&n.getMode()==="source"&&n.editor.setCursor(s,e.start.col)}}}getCoverPath(a,e){let t=a.substring(0,a.lastIndexOf("/")),i=a.substring(a.lastIndexOf("/")+1),s=i.substring(0,i.lastIndexOf(".")),n=t;return e.coverFolder&&e.coverFolder.trim()!==""&&(n=e.coverFolder.startsWith("/")?e.coverFolder.substring(1):t+"/"+e.coverFolder),`${n}/${s}.${e.coverExtension}`}};var K=require("obsidian"),j=class extends K.Modal{constructor(e,t,i,s,n){super(e);this.imgStatus=null;this.isDragging=!1;this.imageElement=null;this.imageContainer=null;this.boundMouseMove=null;this.boundMouseUp=null;this.image=t,this.references=i,this.getImagePath=s,this.onOpenReference=n}onOpen(){let{contentEl:e,modalEl:t}=this;t.addClass("image-manager-preview-modal-container"),e.addClass("image-manager-preview-modal"),e.empty(),this.renderToolbar(),this.renderContent()}renderToolbar(){let t=this.contentEl.createDiv({cls:"image-manager-preview-toolbar"}).createDiv({cls:"image-manager-preview-title"});t.createSpan({text:this.image.name});let i=this.image.originalFile.extension.toUpperCase();t.createSpan({cls:"image-manager-format-tag",text:i}).addClass(this.image.isCustomType?"image-manager-agx-format-tag":"image-manager-other-format-tag"),this.image.referenceCount!==void 0&&this.image.referenceCount>0&&t.createSpan({cls:"image-manager-reference-tag",text:`${this.image.referenceCount} \u4E2A\u5F15\u7528`})}renderContent(){let e=this.contentEl.createDiv({cls:"image-manager-preview-content"});this.renderImageSection(e),this.renderInfoSection(e)}renderImageSection(e){let t=e.createDiv({cls:"image-manager-preview-image-section"}),i=t.createDiv({cls:"image-manager-preview-image-container image-manager-canvas"});this.imageContainer=i;let s=activeDocument.createElement("img");s.addClass("image-manager-preview-image"),s.src=this.getImagePath(this.image),s.alt=this.image.name,i.appendChild(s),this.imageElement=s,this.image.displayFile.extension.toLowerCase()==="svg"&&s.addClass("image-manager-svg-image");let n=!1;s.onerror=()=>{if(n)return;n=!0,s.src="",s.addClass("image-manager-cover-hidden");let c=i.createDiv({cls:"image-manager-preview-error"}),m=c.createDiv({cls:"image-manager-preview-error-icon"});(0,K.setIcon)(m,"alert-triangle"),c.createEl("div",{text:"\u56FE\u7247\u52A0\u8F7D\u5931\u8D25",cls:"image-manager-preview-error-text"}),c.createEl("div",{text:"\u6587\u4EF6\u53EF\u80FD\u5DF2\u635F\u574F\u3001\u8FC7\u5927\u6216\u683C\u5F0F\u4E0D\u652F\u6301",cls:"image-manager-preview-error-hint"})};let r=window.setTimeout(()=>{!s.complete&&!n&&s.onerror?.(new Event("error"))},15e3);s.onload=()=>{window.clearTimeout(r),s.addClass("is-loaded"),this.initImageStatus(s,i)},s.addEventListener("wheel",c=>{if(c.stopPropagation(),c.preventDefault(),!this.imgStatus||!this.imageElement)return;let m=c.deltaY<0?.1:-.1;this.zoomImage(m,c.offsetX,c.offsetY)},{passive:!1}),s.addEventListener("mousedown",c=>{c.button!==0||!this.imgStatus||(c.stopPropagation(),c.preventDefault(),this.isDragging=!0,this.imgStatus.moveX=this.imgStatus.left-c.clientX,this.imgStatus.moveY=this.imgStatus.top-c.clientY,i.addClass("image-manager-canvas-dragging"))});let o=c=>{!this.isDragging||!this.imgStatus||(this.imgStatus.left=c.clientX+this.imgStatus.moveX,this.imgStatus.top=c.clientY+this.imgStatus.moveY,this.applyTransform())},l=()=>{this.isDragging&&(this.isDragging=!1,i.removeClass("image-manager-canvas-dragging"))};this.boundMouseMove=o,this.boundMouseUp=l,activeDocument.addEventListener("mousemove",o),activeDocument.addEventListener("mouseup",l),i.addEventListener("dblclick",()=>{this.imageElement&&this.imageContainer&&this.initImageStatus(this.imageElement,this.imageContainer)}),this.renderDetails(t)}initImageStatus(e,t){let s=t.clientWidth,n=t.clientHeight,r=e.naturalWidth,o=e.naturalHeight,l=r,c=o,m=s*.9,g=n*.9;c>g&&(c=g,l=c/o*r),l>m&&(l=m),c=l*o/r;let h=(s-l)/2,f=(n-c)/2;this.imgStatus={realWidth:r,realHeight:o,curWidth:l,curHeight:c,left:h,top:f,moveX:0,moveY:0},this.applyTransform()}zoomImage(e,t,i){if(!this.imgStatus||!this.imageElement)return;let s=e>0?1+e:1/(1-e),n=this.imgStatus.curWidth*s,r=this.imgStatus.curHeight*s;n<50||r<50||(this.imgStatus.left=this.imgStatus.left+t*(1-s),this.imgStatus.top=this.imgStatus.top+i*(1-s),this.imgStatus.curWidth=n,this.imgStatus.curHeight=r,this.applyTransform())}applyTransform(){!this.imgStatus||!this.imageElement||this.imageElement.setCssProps({"--afm-preview-width":this.imgStatus.curWidth+"px","--afm-preview-height":"auto","--afm-preview-left":this.imgStatus.left+"px","--afm-preview-top":this.imgStatus.top+"px"})}renderInfoSection(e){let t=e.createDiv({cls:"image-manager-preview-info-section"});this.renderBacklinks(t)}renderDetails(e){let t=e.createDiv({cls:"image-manager-detail-section"});t.createEl("h4",{text:"\u8BE6\u7EC6\u4FE1\u606F"}),this.image.isCustomType?this.renderDualColumnDetails(t):this.renderSingleColumnDetails(t)}renderSingleColumnDetails(e){let t=e.createDiv({cls:"image-manager-detail-list"});this.createDetailItem(t,"\u8DEF\u5F84",this.image.path);let i=(this.image.stat.size/1024).toFixed(2);this.createDetailItem(t,"\u5927\u5C0F",`${i} KB`);let s=new Date(this.image.stat.ctime).toLocaleString("zh-CN");this.createDetailItem(t,"\u521B\u5EFA\u65F6\u95F4",s);let n=new Date(this.image.stat.mtime).toLocaleString("zh-CN");this.createDetailItem(t,"\u4FEE\u6539\u65F6\u95F4",n)}renderDualColumnDetails(e){let t=e.createDiv({cls:"image-manager-detail-dual-columns"}),i=t.createDiv({cls:"image-manager-detail-column"});i.createEl("h5",{text:"\u6E90\u6587\u4EF6"});let s=i.createDiv({cls:"image-manager-detail-list"});this.createDetailItem(s,"\u8DEF\u5F84",this.image.originalFile.path);let n=(this.image.stat.size/1024).toFixed(2);this.createDetailItem(s,"\u5927\u5C0F",`${n} KB`);let r=new Date(this.image.stat.ctime).toLocaleString("zh-CN");this.createDetailItem(s,"\u521B\u5EFA\u65F6\u95F4",r);let o=new Date(this.image.stat.mtime).toLocaleString("zh-CN");this.createDetailItem(s,"\u4FEE\u6539\u65F6\u95F4",o),this.image.customTypeConfig&&this.createDetailItem(s,"\u7C7B\u578B",this.image.customTypeConfig.fileExtension.toUpperCase());let l=t.createDiv({cls:"image-manager-detail-column"});l.createEl("h5",{text:"\u5C01\u9762\u6587\u4EF6"});let c=l.createDiv({cls:"image-manager-detail-list"});if(this.image.coverMissing)this.createDetailItem(c,"\u72B6\u6001","\u5C01\u9762\u7F3A\u5931");else{let m=this.image.displayFile.stat;this.createDetailItem(c,"\u8DEF\u5F84",this.image.displayFile.path);let g=(m.size/1024).toFixed(2);this.createDetailItem(c,"\u5927\u5C0F",`${g} KB`);let h=new Date(m.ctime).toLocaleString("zh-CN");this.createDetailItem(c,"\u521B\u5EFA\u65F6\u95F4",h);let f=new Date(m.mtime).toLocaleString("zh-CN");this.createDetailItem(c,"\u4FEE\u6539\u65F6\u95F4",f),this.createDetailItem(c,"\u7C7B\u578B",this.image.displayFile.extension.toUpperCase())}}createDetailItem(e,t,i){let s=e.createDiv({cls:"image-manager-detail-item"});s.createDiv({cls:"image-manager-detail-label",text:t}),s.createDiv({cls:"image-manager-detail-value",text:i})}renderBacklinks(e){let t=e.createDiv({cls:"image-manager-backlinks-section"});t.createEl("h4",{text:"\u5F15\u7528\u7B14\u8BB0"});let i=t.createDiv({cls:"image-manager-backlinks-list"});this.references.length===0?this.renderNoBacklinks(i):this.references.forEach(s=>{this.renderBacklinkItem(i,s)})}renderNoBacklinks(e){e.createDiv({cls:"image-manager-no-backlinks"}).createDiv({text:"\u6682\u65E0\u5F15\u7528"})}renderBacklinkItem(e,t){let i=e.createDiv({cls:"image-manager-backlink-item"});i.addEventListener("click",()=>{this.onOpenReference?.(t.file.path,t.position),this.close()});let s=i.createDiv({cls:"image-manager-backlink-info"});s.createDiv({cls:"image-manager-backlink-name",text:t.file.basename}),s.createDiv({cls:"image-manager-backlink-path",text:t.file.path})}onClose(){this.boundMouseMove&&(activeDocument.removeEventListener("mousemove",this.boundMouseMove),this.boundMouseMove=null),this.boundMouseUp&&(activeDocument.removeEventListener("mouseup",this.boundMouseUp),this.boundMouseUp=null),this.imageElement=null,this.imageContainer=null,this.imgStatus=null,this.isDragging=!1;let{contentEl:e}=this;e.empty()}};var Ie=require("obsidian"),Z=class extends Ie.Modal{constructor(a,e,t){super(a),this.image=e,this.onConfirm=t}onOpen(){let{contentEl:a}=this;a.addClass("image-manager-rename-modal"),a.createEl("h3",{text:"\u91CD\u547D\u540D\u6587\u4EF6"});let e=a.createDiv({cls:"image-manager-rename-form"}),t=this.image.name,i=this.image.originalFile.extension,s=t.replace(new RegExp(`\\.${i}$`),"");this.inputEl=e.createEl("input",{cls:"image-manager-rename-input",attr:{type:"text",value:s}}),e.createDiv({cls:"image-manager-file-extension",text:`.${i}`});let n=a.createDiv({cls:"image-manager-modal-actions"});n.createEl("button",{cls:"image-manager-cancel-button",text:"\u53D6\u6D88"}).addEventListener("click",()=>{this.close()}),n.createEl("button",{cls:"image-manager-confirm-button",text:"\u786E\u5B9A"}).addEventListener("click",()=>{this.handleConfirm()}),this.inputEl.addEventListener("keydown",l=>{l.key==="Enter"?this.handleConfirm():l.key==="Escape"&&this.close()}),this.inputEl.focus(),this.inputEl.select()}async handleConfirm(){let a=this.inputEl.value.trim();if(!a)return;let e=this.image.originalFile.extension,t=`${a}.${e}`;await this.onConfirm(t),this.close()}onClose(){let{contentEl:a}=this;a.empty()}};var we=require("obsidian"),J=class extends we.Modal{constructor(a,e,t,i){super(a),this.image=e,this.extraMessage=t,this.onConfirm=i}onOpen(){let{contentEl:a}=this;a.addClass("delete-confirm-modal");let e=a.createDiv("delete-confirm-modal-body"),t=e.createDiv("delete-confirm-modal-message");t.createSpan({text:"\u786E\u5B9A\u8981\u5220\u9664\u6587\u4EF6 "}),t.createEl("strong",{text:this.image.name}),t.createSpan({text:" \u5417\uFF1F"}),this.extraMessage&&e.createDiv("delete-confirm-modal-extra").setText(this.extraMessage);let i=a.createDiv("delete-confirm-modal-actions"),s=i.createEl("button",{cls:"delete-confirm-cancel-button",text:"\u53D6\u6D88"});s.addEventListener("click",()=>{this.close()}),i.createEl("button",{cls:"delete-confirm-delete-button",text:"\u5220\u9664"}).addEventListener("click",()=>{this.handleConfirm()}),window.setTimeout(()=>s.focus(),0),this.scope.register([],"Escape",()=>(this.close(),!1)),this.scope.register([],"Enter",async()=>(await this.handleConfirm(),!1))}async handleConfirm(){try{await this.onConfirm(),this.close()}catch{}}onClose(){let{contentEl:a}=this;a.empty()}};var Ee=require("obsidian"),N=class extends Ee.Modal{constructor(e,t,i){super(e);this.bodyEl=null;this.actionsEl=null;this.progressEl=null;this.images=t,this.onConfirm=i}onOpen(){let{contentEl:e}=this;e.addClass("delete-confirm-modal");let t=this.images.filter(c=>!c.isCustomType),i=this.images.filter(c=>c.isCustomType),s=t.length+i.length*2;this.bodyEl=e.createDiv("delete-confirm-modal-body");let n=this.bodyEl.createDiv("delete-confirm-modal-message");n.createSpan({text:"\u786E\u8BA4\u8981\u5220\u9664 "}),n.createEl("strong",{text:`${this.images.length} \u5F20\u56FE\u7247`}),n.createSpan({text:" \u5417\uFF1F"});let r=this.bodyEl.createDiv("delete-confirm-modal-extra");i.length>0?r.setText(`\u666E\u901A\u56FE\u7247 ${t.length} \u5F20\uFF0C\u7279\u6B8A\u56FE\u7247 ${i.length} \u5F20\uFF0C\u5171\u5220\u9664 ${s} \u4E2A\u6587\u4EF6`):r.setText(`\u5171\u5220\u9664 ${s} \u4E2A\u6587\u4EF6`),this.actionsEl=e.createDiv("delete-confirm-modal-actions");let o=this.actionsEl.createEl("button",{cls:"delete-confirm-modal-cancel",text:"\u53D6\u6D88"});o.addEventListener("click",()=>{this.close()}),this.actionsEl.createEl("button",{cls:"delete-confirm-modal-delete",text:"\u5220\u9664\u5168\u90E8"}).addEventListener("click",()=>{this.handleConfirm()}),window.setTimeout(()=>o.focus(),0),this.scope.register([],"Escape",()=>(this.close(),!1)),this.scope.register([],"Enter",async()=>(await this.handleConfirm(),!1))}async handleConfirm(){try{this.showLoadingState(),await this.onConfirm((e,t)=>{this.updateProgress(e,t)}),this.close()}catch{this.hideLoadingState()}}updateProgress(e,t){if(this.progressEl){let i=Math.round(e/t*100);this.progressEl.setText(`\u6B63\u5728\u5220\u9664... ${e}/${t} (${i}%)`)}}showLoadingState(){if(!this.bodyEl||!this.actionsEl)return;this.bodyEl.empty(),this.actionsEl.empty();let e=this.bodyEl.createDiv("delete-confirm-loading");e.createDiv("delete-confirm-loading-spinner"),this.progressEl=e.createDiv({text:"\u6B63\u5728\u5220\u9664\u56FE\u7247...",cls:"delete-confirm-loading-text"})}hideLoadingState(){!this.bodyEl||!this.actionsEl||(this.contentEl.empty(),this.onOpen())}onClose(){let{contentEl:e}=this;e.empty()}};var Me=require("obsidian"),O=class extends Me.AbstractInputSuggest{constructor(a,e,t){super(a,e),t&&this.onSelect(i=>{t(i.path)})}getSuggestions(a){let e=(a||"").toLowerCase();return this.app.vault.getAllFolders().filter(t=>t.path.toLowerCase().includes(e)).sort((t,i)=>t.path.localeCompare(i.path))}renderSuggestion(a,e){e.setText(a.path||"/")}};var be=require("obsidian"),W=class extends be.SuggestModal{constructor(a,e){super(a),this.onChoose=e,this.setPlaceholder("\u9009\u62E9\u76EE\u6807\u6587\u4EF6\u5939...")}getSuggestions(a){let e=a.toLowerCase();return this.app.vault.getAllFolders().filter(t=>t.path.toLowerCase().includes(e)).sort((t,i)=>t.path.localeCompare(i.path))}renderSuggestion(a,e){e.createDiv({text:a.path||"/"})}onChooseSuggestion(a){this.onChoose(a)}};var R="image-flow-library",H=class extends w.ItemView{constructor(e,t){super(e);this.images=[];this.filteredImages=[];this.searchQuery="";this.sortField="mtime";this.sortOrder="desc";this.showUnreferencedOnly=!1;this.isLoading=!1;this.isCheckingReferences=!1;this.folderSuggest=null;this.isMultiSelectMode=!1;this.selectedImages=new Set;this.renderedCount=0;this.batchSize=50;this.isLoadingMore=!1;this.scrollThreshold=500;this.intersectionObserver=null;this.activeImageLoads=0;this.maxConcurrentLoads=6;this.imageLoadQueue=[];this.pendingRenderRAF=null;this.settings=t,this.selectedFolder=t.lastSelectedFolder??t.folderPath??"",this.showUnreferencedOnly=!1,this.sortField=t.defaultSortField||"mtime",this.sortOrder=t.defaultSortOrder||"desc",this.imageLoader=new z(this.app),this.imageLoader.setCustomFileTypes(t.customFileTypes||[]),this.imageLoader.setExcludedFolders(t.excludedFolders||[]),this.referenceChecker=new Y(this.app),this.fileOperations=new Q(this.app)}getViewType(){return R}getDisplayText(){return"\u56FE\u7247\u7BA1\u7406\u5668"}getIcon(){return"images"}async onOpen(){let{contentEl:e}=this;e.empty(),e.addClass("image-manager-container"),this.setupLayout(),await Promise.resolve(),this.loadImages()}onClose(){return this.intersectionObserver?.disconnect(),this.intersectionObserver=null,this.imageLoadQueue=[],this.activeImageLoads=0,this.contentEl.empty(),Promise.resolve()}updateSettings(e){this.settings=e,this.selectedFolder=e.lastSelectedFolder??e.folderPath??"",this.imageLoader.setCustomFileTypes(e.customFileTypes||[]),this.loadImages()}setupLayout(){let{contentEl:e}=this;this.headerContainer=e.createDiv("image-manager-header"),this.renderHeader(),this.searchContainer=e.createDiv("image-manager-search"),this.renderSearchBar();let t=e.createDiv("image-manager-grid-panel");this.gridContainer=t,this.gridContainer.addEventListener("scroll",()=>this.handleScroll())}renderHeader(){this.headerContainer.empty();let e=this.headerContainer.createDiv("image-manager-header-row"),t=e.createDiv("image-manager-header-left"),i=t.createDiv("image-manager-folder-input-container"),s=i.createEl("input",{type:"text",placeholder:"\u6309\u6587\u4EF6\u5939\u7B5B\u9009...",value:this.selectedFolder,cls:"image-manager-folder-input"});if(this.selectedFolder){let c=i.createEl("button",{cls:"image-manager-folder-clear clickable-icon",attr:{"aria-label":"\u6E05\u7A7A\u7B5B\u9009"}});(0,w.setIcon)(c,"x"),c.onclick=async()=>{this.selectedFolder="",await this.refresh()}}this.folderSuggest&&this.folderSuggest.close(),this.folderSuggest=new O(this.app,s,c=>{this.selectedFolder=c,this.refresh()}),s.addEventListener("keydown",c=>{c.key==="Enter"&&(this.selectedFolder=s.value,this.refresh())});let n=t.createDiv("image-manager-stats");n.createSpan({text:`${this.images.length}`,cls:"image-manager-stats-number"}),n.createSpan({text:" \u5F20\u56FE\u7247",cls:"image-manager-stats-label"}),this.showUnreferencedOnly&&(n.createSpan({text:" / ",cls:"image-manager-stats-sep"}),n.createSpan({text:`\u7B5B\u9009 ${this.filteredImages.length}`,cls:"image-manager-stats-number"}),n.createSpan({text:" \u5F20",cls:"image-manager-stats-label"}));let r=e.createDiv("image-manager-header-right");if(this.isMultiSelectMode&&this.selectedImages.size>0){let c=r.createEl("button",{cls:"clickable-icon",attr:{"aria-label":`\u79FB\u52A8\u9009\u4E2D (${this.selectedImages.size})`}});(0,w.setIcon)(c,"folder-tree"),c.createSpan({text:`${this.selectedImages.size}`,cls:"image-manager-icon-badge"}),c.onclick=()=>this.handleBatchMoveSelected();let m=r.createEl("button",{cls:"clickable-icon image-manager-destructive-icon",attr:{"aria-label":`\u5220\u9664\u9009\u4E2D (${this.selectedImages.size})`}});(0,w.setIcon)(m,"trash-2"),m.createSpan({text:`${this.selectedImages.size}`,cls:"image-manager-icon-badge image-manager-badge-destructive"}),m.onclick=()=>this.handleBatchDeleteSelected()}else if(this.showUnreferencedOnly&&this.filteredImages.length>0){let c=r.createEl("button",{cls:"clickable-icon image-manager-destructive-icon",attr:{"aria-label":"\u5220\u9664\u5168\u90E8\u672A\u5F15\u7528"}});(0,w.setIcon)(c,"trash-2"),c.createSpan({text:"all",cls:"image-manager-icon-badge image-manager-badge-destructive"}),c.onclick=()=>this.handleBatchDelete()}let o=r.createEl("button",{cls:"clickable-icon",attr:{"aria-label":this.isMultiSelectMode?"\u53D6\u6D88\u591A\u9009":"\u591A\u9009"}});(0,w.setIcon)(o,this.isMultiSelectMode?"x-square":"copy-check"),this.isMultiSelectMode&&o.addClass("is-active"),o.onclick=()=>{this.isMultiSelectMode=!this.isMultiSelectMode,this.isMultiSelectMode||this.selectedImages.clear(),this.renderHeader(),this.renderGrid()};let l=r.createEl("button",{cls:"clickable-icon",attr:{"aria-label":"\u5237\u65B0"}});(0,w.setIcon)(l,"refresh-cw"),l.onclick=()=>{this.refresh()}}renderSearchBar(){this.searchContainer.empty(),this.searchContainer.addClass("image-manager-search-sort-bar");let t=this.searchContainer.createDiv("image-manager-search-box").createEl("input",{type:"text",placeholder:"\u641C\u7D22\u56FE\u7247...",value:this.searchQuery,cls:"image-manager-search-input"});t.oninput=()=>{this.searchQuery=t.value,this.applyFilters(),this.renderGrid()};let i=this.searchContainer.createDiv("image-manager-sort-controls"),s=i.createEl("button",{cls:"clickable-icon",attr:{"aria-label":this.showUnreferencedOnly?"\u663E\u793A\u5168\u90E8":"\u7B5B\u9009\u672A\u5F15\u7528"}});(0,w.setIcon)(s,this.showUnreferencedOnly?"filter-x":"filter"),this.showUnreferencedOnly&&s.addClass("is-active"),s.onclick=async()=>{let o=this.images.filter(l=>l.references===void 0);!this.showUnreferencedOnly&&o.length>0&&await this.checkReferences(),this.showUnreferencedOnly=!this.showUnreferencedOnly,this.applyFilters(),this.renderSearchBar(),this.renderHeader(),this.renderGrid()};let n=i.createEl("button",{cls:"clickable-icon",attr:{"aria-label":"\u6392\u5E8F\u65B9\u5F0F"}});(0,w.setIcon)(n,"arrow-up-narrow-wide"),n.onclick=o=>{let l=new w.Menu;[{value:"mtime",text:"\u4FEE\u6539\u65F6\u95F4"},{value:"ctime",text:"\u521B\u5EFA\u65F6\u95F4"},{value:"size",text:"\u6587\u4EF6\u5927\u5C0F"},{value:"name",text:"\u6587\u4EF6\u540D"},{value:"references",text:"\u5F15\u7528\u6570\u91CF"}].forEach(m=>{l.addItem(g=>{g.setTitle(m.text).setChecked(this.sortField===m.value).onClick(async()=>{this.sortField=m.value,m.value==="references"&&this.images.filter(f=>f.references===void 0).length>0&&await this.checkReferences(),this.applyFilters(),this.renderGrid()})})}),l.showAtMouseEvent(o)};let r=i.createEl("button",{cls:"clickable-icon",attr:{"aria-label":this.sortOrder==="desc"?"\u964D\u5E8F":"\u5347\u5E8F"}});this.updateSortOrderButton(r),r.onclick=()=>{this.sortOrder=this.sortOrder==="asc"?"desc":"asc",this.updateSortOrderButton(r),this.applyFilters(),this.renderGrid()}}updateSortOrderButton(e){e.empty(),this.sortOrder==="desc"?((0,w.setIcon)(e,"arrow-down"),e.setAttribute("aria-label","\u964D\u5E8F")):((0,w.setIcon)(e,"arrow-up"),e.setAttribute("aria-label","\u5347\u5E8F"))}renderGrid(e=!1){if(e||(this.pendingRenderRAF!==null&&(cancelAnimationFrame(this.pendingRenderRAF),this.pendingRenderRAF=null),this.renderedCount=0,this.intersectionObserver?.disconnect(),this.intersectionObserver=null,this.imageLoadQueue=[],this.activeImageLoads=0),this.isLoading&&!e){this.gridContainer.empty();let n=this.gridContainer.createDiv("image-manager-loading-state");n.createDiv("image-manager-loading-spinner"),n.createSpan({text:"\u52A0\u8F7D\u4E2D..."});return}if(this.filteredImages.length===0&&!e){this.gridContainer.empty();let n=this.gridContainer.createDiv("image-manager-empty-state");n.createSpan({text:this.images.length===0?"\u6CA1\u6709\u627E\u5230\u56FE\u7247":"\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u56FE\u7247"}),this.images.length===0&&n.createDiv("image-manager-empty-hint").createSpan({text:"\u63D0\u793A\uFF1A\u8BF7\u68C0\u67E5\u6587\u4EF6\u5939\u8DEF\u5F84\u8BBE\u7F6E"});return}let t=this.renderedCount,i=Math.min(t+this.batchSize,this.filteredImages.length),s=this.filteredImages.slice(t,i);this.pendingRenderRAF=window.requestAnimationFrame(()=>{this.pendingRenderRAF=null;let n=null;e?n=this.gridContainer.querySelector(".image-manager-grid"):this.gridContainer.empty(),n||(n=this.gridContainer.createDiv("image-manager-grid"));let r=this.renderImageBatch(n,s);this.renderedCount=i,this.isLoadingMore=!1,this.updateLoadMoreIndicator(),window.requestAnimationFrame(()=>{this.renderedCount<this.filteredImages.length&&this.gridContainer.scrollHeight<=this.gridContainer.clientHeight&&this.loadMoreImages()}),typeof requestIdleCallback<"u"?requestIdleCallback(()=>{this.checkBatchReferences(s,r)},{timeout:2e3}):window.setTimeout(()=>{this.checkBatchReferences(s,r)},100)})}renderImageBatch(e,t){let i=[];return t.forEach(s=>{let n=e.createDiv("image-manager-grid-item");n.setAttribute("data-path",s.path),this.isMultiSelectMode&&this.selectedImages.has(s.path)&&n.addClass("image-manager-item-selected");let r=n.createDiv("image-manager-thumbnail");if(r.onclick=()=>{this.isMultiSelectMode?(this.selectedImages.has(s.path)?(this.selectedImages.delete(s.path),n.removeClass("image-manager-item-selected")):(this.selectedImages.add(s.path),n.addClass("image-manager-item-selected")),this.renderHeader()):this.handlePreview(s)},r.addClass("cursor-pointer"),s.coverMissing){let E=r.createDiv({cls:"image-manager-cover-missing"}).createDiv({cls:"image-manager-cover-missing-content"}),v=E.createEl("span",{cls:"image-manager-cover-missing-icon"});(0,w.setIcon)(v,"file-x"),E.createEl("span",{text:"\u5C01\u9762\u7F3A\u5931",cls:"image-manager-cover-missing-text"})}else{let p=r.createEl("img",{cls:s.displayFile.extension.toLowerCase()==="svg"?"image-manager-svg-image":"image-manager-thumbnail-image"}),E=this.app.vault.getResourcePath(s.displayFile);p.setAttribute("data-src",E),p.alt=s.name;let v=!1;p.onerror=()=>{if(v)return;v=!0,p.src="",p.addClass("image-manager-cover-hidden");let M=r.createDiv("image-manager-cover-missing").createDiv("image-manager-cover-missing-content"),C=M.createEl("span",{cls:"image-manager-cover-missing-icon"});(0,w.setIcon)(C,"alert-circle"),M.createEl("span",{text:"\u52A0\u8F7D\u5931\u8D25",cls:"image-manager-cover-missing-text"})},this.observeThumbnail(r,p)}let o=r.createDiv("image-manager-image-actions");let afCopyButton=o.createEl("button",{cls:"image-manager-action-button image-manager-copy-button clickable-icon",attr:{"aria-label":"复制嵌入链接"}});(0,w.setIcon)(afCopyButton,"copy"),afCopyButton.onclick=async p=>{p.stopPropagation();let E=this.app.vault.getFiles().filter(v=>v.name===s.originalFile.name),I=E.length>1?s.originalFile.path:s.originalFile.name;try{await navigator.clipboard.writeText(`![[${I}]]`),new w.Notice("已复制图片嵌入链接。")}catch{new w.Notice("复制失败。")}};let l=o.createEl("button",{cls:"image-manager-action-button image-manager-open-button clickable-icon",attr:{"aria-label":"\u6253\u5F00"}});(0,w.setIcon)(l,"folder-open"),l.onclick=p=>{p.stopPropagation(),this.fileOperations.openFile(s)};let c=o.createEl("button",{cls:"image-manager-action-button image-manager-rename-button clickable-icon",attr:{"aria-label":"\u91CD\u547D\u540D"}});(0,w.setIcon)(c,"pencil"),c.onclick=p=>{p.stopPropagation(),this.handleRename(s)};let m=o.createEl("button",{cls:"image-manager-action-button image-manager-move-button clickable-icon",attr:{"aria-label":"\u79FB\u52A8"}});(0,w.setIcon)(m,"folder-tree"),m.onclick=p=>{p.stopPropagation(),this.handleMove(s)};let g=o.createEl("button",{cls:"image-manager-action-button image-manager-delete-button clickable-icon",attr:{"aria-label":"\u5220\u9664"}});if((0,w.setIcon)(g,"trash-2"),g.onclick=p=>{p.stopPropagation(),this.handleDelete(s)},r.createDiv({text:s.originalFile.extension.toUpperCase(),cls:"image-manager-format-badge"}).addClass(s.isCustomType?"image-manager-agx-format":"image-manager-other-format"),s.references){let p=s.referenceCount||0,E=r.createDiv({text:p===0?"\u672A\u5F15\u7528":`${p} \u5F15\u7528`,cls:"image-manager-reference-badge"});p>0&&E.addClass("image-manager-reference-badge-has-refs")}let f=n.createDiv("image-manager-image-info cursor-pointer");f.onclick=p=>{p.stopPropagation(),this.isMultiSelectMode?(this.selectedImages.has(s.path)?(this.selectedImages.delete(s.path),n.removeClass("image-manager-item-selected")):(this.selectedImages.add(s.path),n.addClass("image-manager-item-selected")),this.renderHeader()):this.handlePreview(s)},f.createDiv({text:s.name,cls:"image-manager-image-name",attr:{title:s.path}});let b=f.createDiv("image-manager-image-meta");this.settings.showFileSize&&b.createSpan({text:this.formatFileSize(s.stat.size),cls:"image-manager-meta-item image-manager-meta-size"}),this.settings.showModifiedTime&&b.createSpan({text:new Date(s.stat.mtime).toLocaleDateString(),cls:"image-manager-meta-item image-manager-meta-date"}),i.push({image:s,element:n})}),i}setupIntersectionObserver(){this.intersectionObserver||(this.intersectionObserver=new IntersectionObserver(e=>{e.forEach(t=>{if(t.isIntersecting){let i=t.target,s=i.querySelector("img[data-src]");s&&(this.enqueueImageLoad(s),this.intersectionObserver?.unobserve(i))}})},{root:this.gridContainer,rootMargin:"200px 0px"}))}observeThumbnail(e,t){this.setupIntersectionObserver(),this.intersectionObserver?.observe(e)}enqueueImageLoad(e){let t=()=>{let i=e.getAttribute("data-src");if(!i)return;this.activeImageLoads++,e.removeAttribute("data-src");let s=window.setTimeout(()=>{e.complete||e.onerror?.(new Event("error"))},15e3);e.onload=()=>{window.clearTimeout(s),e.addClass("is-loaded"),this.activeImageLoads--,this.processImageLoadQueue()};let n=e.onerror;e.onerror=r=>{window.clearTimeout(s),this.activeImageLoads--,typeof n=="function"&&n.call(e,r),this.processImageLoadQueue()},e.src=i};this.activeImageLoads<this.maxConcurrentLoads?t():this.imageLoadQueue.push(t)}processImageLoadQueue(){for(;this.imageLoadQueue.length>0&&this.activeImageLoads<this.maxConcurrentLoads;)this.imageLoadQueue.shift()?.()}handleScroll(){if(this.isLoadingMore||this.renderedCount>=this.filteredImages.length)return;let e=this.gridContainer,t=e.scrollTop,i=e.scrollHeight,s=e.clientHeight;i-t-s<this.scrollThreshold&&this.loadMoreImages()}loadMoreImages(){this.isLoadingMore||this.renderedCount>=this.filteredImages.length||(this.isLoadingMore=!0,this.renderGrid(!0))}updateLoadMoreIndicator(){let e=this.gridContainer.querySelector(".image-manager-load-more");e&&e.remove(),this.renderedCount<this.filteredImages.length&&this.gridContainer.createDiv("image-manager-load-more").setText(`\u5DF2\u663E\u793A ${this.renderedCount} / ${this.filteredImages.length} \u5F20\u56FE\u7247`)}loadImages(){if(this.isLoading)return;this.isLoading=!0,this.renderGrid();let e=new Map;for(let t of this.images)t.referenceCount!==void 0&&e.set(t.path,{referenceCount:t.referenceCount,references:t.references});try{this.images=this.imageLoader.loadImages(this.selectedFolder);for(let t of this.images){let i=e.get(t.path);i&&(t.referenceCount=i.referenceCount,t.references=i.references)}this.applyFilters(),this.renderHeader()}catch(t){new w.Notice(`\u52A0\u8F7D\u56FE\u7247\u5931\u8D25: ${t instanceof Error?t.message:String(t)}`)}finally{this.isLoading=!1,this.renderGrid()}}async checkReferences(){if(this.isCheckingReferences||this.images.length===0)return;this.isCheckingReferences=!0;let e=new w.Notice(`\u6B63\u5728\u68C0\u67E5\u5F15\u7528... 0/${this.images.length}`,0);try{this.images=await this.referenceChecker.checkReferences(this.images,(t,i)=>{let s=Math.round(t/i*100);e.setMessage(`\u6B63\u5728\u68C0\u67E5\u5F15\u7528... ${t}/${i} (${s}%)`)}),e.hide(),this.applyFilters(),this.renderHeader(),this.renderGrid(),new w.Notice(`\u5F15\u7528\u68C0\u67E5\u5B8C\u6210\uFF1A\u5DF2\u68C0\u67E5 ${this.images.length} \u5F20\u56FE\u7247`)}catch(t){e.hide(),new w.Notice(`\u68C0\u67E5\u5F15\u7528\u5931\u8D25: ${t instanceof Error?t.message:String(t)}`)}finally{this.isCheckingReferences=!1}}async checkBatchReferences(e,t){let i=e.filter(s=>s.references===void 0);if(i.length!==0)try{for(let n=0;n<i.length;n+=10){let r=i.slice(n,Math.min(n+10,i.length)),o=await this.referenceChecker.checkReferences(r);o.forEach(l=>{let c=this.images.findIndex(m=>m.path===l.path);c!==-1&&(this.images[c]=l)}),t.forEach(({image:l,element:c})=>{let m=o.find(g=>g.path===l.path);m&&m.references!==void 0&&this.updateReferenceDisplay(c,m)}),n+10<i.length&&await new Promise(l=>window.setTimeout(l,10))}}catch{}}updateReferenceDisplay(e,t){let i=e.querySelector(".image-manager-thumbnail");if(!i)return;let s=i.querySelector(".image-manager-reference-badge");s&&s.remove();let n=t.referenceCount||0,r=i.createDiv({text:n===0?"\u672A\u5F15\u7528":`${n} \u5F15\u7528`,cls:"image-manager-reference-badge"});n>0&&r.addClass("image-manager-reference-badge-has-refs")}applyFilters(){let e=[...this.images];if(this.searchQuery){let t=this.searchQuery.toLowerCase();e=e.filter(i=>i.name.toLowerCase().includes(t))}this.showUnreferencedOnly&&(e=e.filter(t=>!t.referenceCount||t.referenceCount===0)),e.sort((t,i)=>{let s=0;switch(this.sortField){case"mtime":s=t.stat.mtime-i.stat.mtime;break;case"ctime":s=t.stat.ctime-i.stat.ctime;break;case"size":s=t.stat.size-i.stat.size;break;case"name":s=t.name.localeCompare(i.name);break;case"references":{let n=t.referenceCount||0,r=i.referenceCount||0;s=n-r;break}}return s===0&&(s=t.path.localeCompare(i.path)),this.sortOrder==="asc"?s:-s}),this.filteredImages=e}handlePreview(e){let t=this.images.find(i=>i.path===e.path)||e;new j(this.app,t,t.references||[],i=>this.app.vault.getResourcePath(i.displayFile),(i,s)=>{this.fileOperations.openReferenceFile(i,s)}).open()}handleRename(e){new Z(this.app,e,t=>(async()=>{try{let i=e.path,s=e.path.replace(/[^/]+$/,t);await this.fileOperations.renameFile(e,t),this.updateImageAfterRename(i,s,t),this.applyFilters(),this.renderHeader(),this.renderGrid()}catch{}})()).open()}handleMove(e){new W(this.app,t=>{(async()=>{try{let i=e.path,s=await this.fileOperations.moveFile(e,t.path);if(!s)return;!this.selectedFolder||s.startsWith(this.selectedFolder+"/")?this.updateImageAfterMove(i,s):this.images=this.images.filter(r=>r.path!==i),this.applyFilters(),this.renderHeader(),this.renderGrid()}catch{}})()}).open()}async handleDelete(e){if(this.settings.confirmDelete===!1){try{await this.fileOperations.deleteFile(e),this.removeImageFromList(e)}catch{}return}let t=this.fileOperations.getDeleteExtraMessage(e);new J(this.app,e,t,async()=>{await this.fileOperations.deleteFile(e),this.removeImageFromList(e)}).open()}updateImageAfterMove(e,t){let i=t.substring(t.lastIndexOf("/")+1);this.updateImageAfterRename(e,t,i)}updateImageAfterRename(e,t,i){let s=this.images.findIndex(r=>r.path===e);s!==-1&&(this.images[s]={...this.images[s],path:t,name:i});let n=this.filteredImages.findIndex(r=>r.path===e);n!==-1&&(this.filteredImages[n]={...this.filteredImages[n],path:t,name:i}),this.referenceChecker.getCache().updateKey(e,t)}removeImageFromList(e){this.images=this.images.filter(i=>i.path!==e.path),this.filteredImages=this.filteredImages.filter(i=>i.path!==e.path),this.selectedImages.delete(e.path),this.referenceChecker.clearCache();let t=this.gridContainer.querySelector(".image-manager-grid");if(t){let i=t.querySelector(`[data-path="${CSS.escape(e.path)}"]`);i&&(i.remove(),this.renderedCount--)}this.updateLoadMoreIndicator(),this.renderHeader()}handleBatchDelete(){if(this.filteredImages.length===0){new w.Notice("\u6CA1\u6709\u8981\u5220\u9664\u7684\u56FE\u7247");return}new N(this.app,this.filteredImages,async t=>{let i=[...this.filteredImages],s=i.length,n=0,r=0,o=10;for(let l=0;l<i.length;l+=o){let m=i.slice(l,Math.min(l+o,i.length)).map(async h=>{try{return await this.fileOperations.deleteFile(h,!0),{success:!0,image:h}}catch{return{success:!1,image:h}}}),g=await Promise.all(m);for(let h of g)h.success?(n++,this.removeImageFromMemory(h.image)):r++;t(n+r,s),await new Promise(h=>window.setTimeout(h,0))}r===0?new w.Notice(`\u6210\u529F\u5220\u9664 ${n} \u5F20\u56FE\u7247`):new w.Notice(`\u5220\u9664\u5B8C\u6210: \u6210\u529F ${n} \u5F20, \u5931\u8D25 ${r} \u5F20`),this.updateLoadMoreIndicator(),this.renderHeader()}).open()}handleBatchDeleteSelected(){if(this.selectedImages.size===0){new w.Notice("\u6CA1\u6709\u9009\u4E2D\u7684\u56FE\u7247");return}let e=this.images.filter(i=>this.selectedImages.has(i.path));new N(this.app,e,async i=>{let s=e.length,n=0,r=0,o=10;for(let l=0;l<e.length;l+=o){let m=e.slice(l,Math.min(l+o,e.length)).map(async h=>{try{return await this.fileOperations.deleteFile(h,!0),{success:!0,image:h}}catch{return{success:!1,image:h}}}),g=await Promise.all(m);for(let h of g)h.success?(n++,this.removeImageFromMemory(h.image),this.selectedImages.delete(h.image.path)):r++;i(n+r,s),await new Promise(h=>window.setTimeout(h,0))}r===0?new w.Notice(`\u6210\u529F\u5220\u9664 ${n} \u5F20\u56FE\u7247`):new w.Notice(`\u5220\u9664\u5B8C\u6210: \u6210\u529F ${n} \u5F20, \u5931\u8D25 ${r} \u5F20`),this.isMultiSelectMode=!1,this.selectedImages.clear(),this.updateLoadMoreIndicator(),this.renderHeader()}).open()}handleBatchMoveSelected(){if(this.selectedImages.size===0){new w.Notice("\u6CA1\u6709\u9009\u4E2D\u7684\u56FE\u7247");return}let e=this.images.filter(t=>this.selectedImages.has(t.path));new W(this.app,t=>{(async()=>{let i=e.length,s=0,n=0,r=new w.Notice(`\u6B63\u5728\u79FB\u52A8... 0/${i}`,0);for(let o of e){try{let l=o.path,c=await this.fileOperations.moveFile(o,t.path,!0);c&&(!this.selectedFolder||c.startsWith(this.selectedFolder+"/")?this.updateImageAfterMove(l,c):this.images=this.images.filter(g=>g.path!==l)),s++}catch{n++}this.selectedImages.delete(o.path),r.setMessage(`\u6B63\u5728\u79FB\u52A8... ${s+n}/${i}`)}r.hide(),n===0?new w.Notice(`\u6210\u529F\u79FB\u52A8 ${s} \u5F20\u56FE\u7247`):new w.Notice(`\u79FB\u52A8\u5B8C\u6210: \u6210\u529F ${s} \u5F20, \u5931\u8D25 ${n} \u5F20`),this.isMultiSelectMode=!1,this.selectedImages.clear(),this.applyFilters(),this.renderHeader(),this.renderGrid()})()}).open()}removeImageFromMemory(e){this.images=this.images.filter(i=>i.path!==e.path),this.filteredImages=this.filteredImages.filter(i=>i.path!==e.path);let t=this.gridContainer.querySelector(".image-manager-grid");if(t){let i=t.querySelector(`[data-path="${CSS.escape(e.path)}"]`);i&&(i.remove(),this.renderedCount--)}}async refresh(){this.loadImages(),await this.saveLastSelectedFolder()}refreshFromVault(){this.loadImages()}async saveLastSelectedFolder(){}formatFileSize(e){return e<1024?e+" B":e<1024*1024?(e/1024).toFixed(1)+" KB":(e/(1024*1024)).toFixed(1)+" MB"}onunload(){this.folderSuggest&&(this.folderSuggest.close(),this.folderSuggest=null),this.intersectionObserver?.disconnect(),this.intersectionObserver=null,this.imageLoadQueue=[]}};
const ImageFlowImageManagerView = H;
const {
  ItemView,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  TFolder,
  normalizePath,
  setIcon,
  setTooltip
} = require("obsidian");

const VIEW_TYPE_LIBRARY = "image-flow-library";
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "avif", "bmp", "ico", "tif", "tiff", "heic", "heif"]);
const CONVERTIBLE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "bmp"]);
const LIBRARY_RENDER_BATCH_SIZE = 50;
const LIBRARY_MAX_CONCURRENT_IMAGE_LOADS = 6;
const DEFAULT_SETTINGS = {
  assetFolderMode: "obsidian-default",
  customAssetFolder: "",
  outputFormat: "jpeg",
  quality: 0.8,
  enableRenameTemplate: false,
  renameTemplate: "{noteName}-{date}-{time}-{index}",
  copyLinkPolicy: "short-if-unique",
  enableImageDragMove: true,
  enableAutoImport: true,
  imageManagerShowFileSize: true,
  imageManagerShowModifiedTime: true,
  imageManagerDefaultSortField: "mtime",
  imageManagerDefaultSortOrder: "desc",
  imageManagerExcludedFolderPaths: ""
};
const LEGACY_IMPORTED_EXCLUDED_FOLDERS = ["01-捕获层", "02-培养层", "03-连接层", "04-创造层"];

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDateParts(date) {
  return {
    date: `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`,
    time: `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`,
    timestamp: String(date.getTime())
  };
}

function stripExtension(name) {
  return name.replace(/\.[^/.]+$/, "");
}

function sanitizeFilename(name) {
  const cleaned = name
    .replace(/[\\/:*?"<>|#^[\]]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\.+/, "")
    .replace(/\.+$/, "");
  return cleaned || "image";
}

function folderOfPath(path) {
  const index = path.lastIndexOf("/");
  return index === -1 ? "" : path.slice(0, index);
}

function extOfFile(file) {
  return (file?.extension || file?.name?.split(".").pop() || file?.path?.split(".").pop() || "").toLowerCase().trim();
}

function formatLabelFromExt(ext) {
  const normalized = String(ext || "").toLowerCase();
  if (normalized === "jpg" || normalized === "jpeg") return "JPEG";
  return normalized.toUpperCase();
}

function extOfPath(path) {
  return (path.split(".").pop() || "").toLowerCase().trim();
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isImageFile(file) {
  if (!file || typeof file !== "object") return false;
  const path = String(file.path || "");
  const name = String(file.name || path.split("/").pop() || "");
  if (!path && !name) return false;
  return IMAGE_EXTENSIONS.has(extOfFile(file)) || IMAGE_EXTENSIONS.has(extOfPath(path)) || IMAGE_EXTENSIONS.has(extOfPath(name));
}

function isFileLikeImage(file) {
  if (!file) return false;
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  return file.type.startsWith("image/") || IMAGE_EXTENSIONS.has(ext);
}

function closestEmbed(node) {
  if (!node) return null;
  return node.closest(".internal-embed.image-embed, .image-embed, span.internal-embed, div.internal-embed");
}

function debounceFn(fn, delay = 300) {
  let timer = null;
  return (...args) => {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

function parseFolderPathList(value) {
  const values = Array.isArray(value) ? value : String(value || "").split(/\r?\n|,/);
  return values
    .map(path => normalizeOptionalFolderPath(path))
    .filter(Boolean);
}

function normalizeOptionalFolderPath(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed || trimmed === "/" || trimmed === ".") return "";
  const normalized = normalizePath(trimmed);
  return normalized === "/" || normalized === "." ? "" : normalized.replace(/^\/+/, "");
}

class ImageFlowImageLoader {
  constructor(app) {
    this.app = app;
    this.excludedFolders = [];
    this.lastScanInfo = {
      totalFiles: 0,
      candidateFiles: 0,
      imageFiles: 0,
      selectedFolder: "",
      excludedFolders: []
    };
  }

  setExcludedFolders(paths) {
    this.excludedFolders = paths
      .map(path => normalizePath(String(path || "").trim()))
      .filter(Boolean);
  }

  loadImages(folder = "") {
    const selectedFolder = normalizeOptionalFolderPath(folder);
    const files = this.getVaultFiles();
    let candidateFiles = 0;
    let imageFiles = 0;
    const images = files
      .filter(file => {
        candidateFiles += 1;
        if (!isImageFile(file)) return false;
        if (selectedFolder && !(file.path === selectedFolder || file.path.startsWith(`${selectedFolder}/`))) return false;
        if (this.excludedFolders.some(excluded => file.path === excluded || file.path.startsWith(`${excluded}/`))) return false;
        imageFiles += 1;
        return true;
      })
      .map(file => this.processImageFile(file));
    this.lastScanInfo = {
      totalFiles: files.length,
      candidateFiles,
      imageFiles,
      selectedFolder,
      excludedFolders: [...this.excludedFolders]
    };
    return images;
  }

  getVaultFiles() {
    const byPath = new Map();
    const add = file => {
      if (!file?.path || !file?.name || !file?.stat) return;
      byPath.set(file.path, file);
    };
    this.app.vault.getFiles().forEach(add);
    if (typeof this.app.vault.getAllLoadedFiles === "function") {
      this.app.vault.getAllLoadedFiles().forEach(add);
    }
    return Array.from(byPath.values());
  }

  processImageFile(file) {
    return {
      name: file.name,
      path: file.path,
      originalFile: file,
      displayFile: file,
      stat: {
        ctime: file.stat.ctime,
        mtime: file.stat.mtime,
        size: file.stat.size
      }
    };
  }

  getImageResourcePath(image) {
    return this.app.vault.getResourcePath(image.displayFile || image.originalFile);
  }
}

class ImageFlowPlugin extends Plugin {
  async onload() {
    const loadedSettings = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedSettings);
    if (loadedSettings?.outputFormat === "webp" && loadedSettings?.quality === 0.75) {
      this.settings.outputFormat = "jpeg";
      this.settings.quality = 0.8;
      await this.saveData(this.settings);
    }
    if (this.settings.outputFormat === "jpg") {
      this.settings.outputFormat = "jpeg";
      await this.saveData(this.settings);
    }
    if (this.shouldClearLegacyImportedExclusions(this.settings.imageManagerExcludedFolderPaths)) {
      this.settings.imageManagerExcludedFolderPaths = "";
      await this.saveData(this.settings);
    }
    if (Array.isArray(this.settings.excludedFolders) && this.shouldClearLegacyImportedExclusions(this.settings.excludedFolders)) {
      delete this.settings.excludedFolders;
      await this.saveData(this.settings);
    }
    if (typeof this.settings.enableImageDragMove !== "boolean") {
      this.settings.enableImageDragMove = this.settings.enableCanvasPositioning ?? true;
    }
    this.importer = new ImportManager(this);
    this.imageMover = new ImageMoveManager(this);

    this.registerView(VIEW_TYPE_LIBRARY, leaf => new ImageFlowImageManagerView(leaf, this.getImageManagerSettings()));

    this.addRibbonIcon("images", "打开图片流图库", () => this.openLibrary());
    this.addCommand({
      id: "open-image-library",
      name: "打开图片图库",
      callback: () => this.openLibrary()
    });
    this.addCommand({
      id: "copy-selected-image-embed-link",
      name: "复制选中图片嵌入链接",
      callback: () => this.copySelectedImageLink()
    });
    this.addSettingTab(new ImageFlowSettingTab(this.app, this));
    this.importer.register();
    this.imageMover.register();
  }

  onunload() {
    this.imageMover?.unload();
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.app.workspace.getLeavesOfType(VIEW_TYPE_LIBRARY).forEach(leaf => {
      if (leaf.view instanceof ImageFlowImageManagerView) {
        leaf.view.updateSettings?.(this.getImageManagerSettings());
      }
    });
  }

  getImageManagerSettings() {
    return {
      folderPath: "",
      lastSelectedFolder: "",
      excludedFolders: parseFolderPathList(this.settings.imageManagerExcludedFolderPaths),
      customFileTypes: [],
      showFileSize: this.settings.imageManagerShowFileSize,
      showModifiedTime: this.settings.imageManagerShowModifiedTime,
      defaultSortField: this.settings.imageManagerDefaultSortField,
      defaultSortOrder: this.settings.imageManagerDefaultSortOrder,
      invertSvgInDarkMode: true
    };
  }

  shouldClearLegacyImportedExclusions(value) {
    const paths = parseFolderPathList(value).sort((a, b) => a.localeCompare(b));
    const legacy = LEGACY_IMPORTED_EXCLUDED_FOLDERS
      .map(path => normalizeOptionalFolderPath(path))
      .sort((a, b) => a.localeCompare(b));
    return paths.length === legacy.length && paths.every((path, index) => path === legacy[index]);
  }

  async openLibrary() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_LIBRARY);
    let leaf = leaves[0];
    if (!leaf) {
      leaf = this.app.workspace.getRightLeaf(false) || this.app.workspace.getLeaf("tab");
      await leaf.setViewState({ type: VIEW_TYPE_LIBRARY, active: true });
    }
    await this.app.workspace.revealLeaf(leaf);
  }

  async copySelectedImageLink() {
    const active = document.activeElement;
    const embed = closestEmbed(active) || closestEmbed(active?.parentElement);
    const path = this.imageMover.getImagePathFromEmbed(embed);
    if (!path) {
      new Notice("未检测到选中的图片。");
      return;
    }
    await copyText(await this.getEmbedLink(path));
    new Notice("已复制图片嵌入链接。");
  }

  async getEmbedLink(path) {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) return `![[${path}]]`;
    if (this.settings.copyLinkPolicy === "always-path") return `![[${file.path}]]`;
    if (this.settings.copyLinkPolicy === "always-short") return `![[${file.name}]]`;
    const sameName = this.app.vault.getFiles().filter(other => other.name === file.name);
    return sameName.length > 1 ? `![[${file.path}]]` : `![[${file.name}]]`;
  }
}

class ImportManager {
  constructor(plugin) {
    this.plugin = plugin;
  }

  register() {
    this.plugin.registerEvent(this.plugin.app.workspace.on("editor-paste", async (evt, editor) => {
      if (!this.plugin.settings.enableAutoImport || !evt.clipboardData) return;
      const files = Array.from(evt.clipboardData.items)
        .map(item => item.kind === "file" ? item.getAsFile() : null)
        .filter(isFileLikeImage);
      if (files.length === 0) return;
      evt.preventDefault();
      await this.handleFiles(files, editor, editor.getCursor());
    }));

    this.plugin.registerEvent(this.plugin.app.workspace.on("editor-drop", async (evt, editor) => {
      if (!this.plugin.settings.enableAutoImport || !evt.dataTransfer) return;
      const files = Array.from(evt.dataTransfer.files).filter(isFileLikeImage);
      if (files.length === 0) return;
      const position = editor.posAtMouse(evt) || editor.getCursor();
      evt.preventDefault();
      await this.handleFiles(files, editor, position);
    }));
  }

  async handleFiles(files, editor, position) {
    const activeFile = this.plugin.app.workspace.getActiveFile();
    if (!(activeFile instanceof TFile)) {
      new Notice("请先打开一篇笔记，再导入图片。");
      return;
    }

    let cursor = position;
    for (let i = 0; i < files.length; i += 1) {
      try {
        const saved = await this.processAndSave(files[i], activeFile, i + 1);
        const link = await this.plugin.getEmbedLink(saved.path);
        editor.replaceRange(link + (files.length > 1 ? "\n" : ""), cursor);
        cursor = { line: cursor.line + (files.length > 1 ? 1 : 0), ch: files.length > 1 ? 0 : cursor.ch + link.length };
      } catch (error) {
        console.error("Image Flow import failed", error);
        new Notice(`导入 ${files[i].name} 失败，详情见控制台。`);
      }
    }
  }

  async processAndSave(file, note, batchIndex) {
    const destinationFolder = await this.getDestinationFolder(note);
    await this.ensureFolder(destinationFolder);

    const target = await this.convertIfPossible(file);
    const ext = target.ext;
    const baseName = this.renderFilename(file, note, batchIndex, ext);
    const path = await this.uniquePath(destinationFolder, `${baseName}.${ext}`);
    const created = await this.plugin.app.vault.createBinary(path, target.buffer);

    this.showSizeComparisonNotification(file.size, target.buffer.byteLength);
    if (target.notice) new Notice(target.notice);
    return created;
  }

  formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  showSizeComparisonNotification(originalSize, processedSize) {
    if (!originalSize || originalSize <= 0) return;
    const delta = ((processedSize - originalSize) / originalSize * 100).toFixed(1);
    const sign = processedSize > originalSize ? "+" : "";
    new Notice(`${this.formatFileSize(originalSize)} → ${this.formatFileSize(processedSize)} (${sign}${delta}%)`);
  }

  async convertIfPossible(file) {
    const originalExt = (file.name.split(".").pop() || "png").toLowerCase();
    const output = this.plugin.settings.outputFormat;
    const keepOriginal = output === "keep-original";
    const targetExt = keepOriginal ? originalExt : output === "jpg" ? "jpeg" : output;

    if (keepOriginal) {
      return {
        ext: originalExt,
        buffer: await file.arrayBuffer(),
        notice: null
      };
    }

    if (!CONVERTIBLE_EXTENSIONS.has(originalExt)) {
      return {
        ext: originalExt,
        buffer: await file.arrayBuffer(),
        notice: `已保留 ${file.name} 原格式；浏览器内无法转换此格式。`
      };
    }

    try {
      const mime = targetExt === "png" ? "image/png" : targetExt === "jpg" || targetExt === "jpeg" ? "image/jpeg" : "image/webp";
      const blob = await this.drawToBlob(file, mime, this.plugin.settings.quality);
      return { ext: targetExt, buffer: await blob.arrayBuffer(), notice: null };
    } catch (error) {
      console.warn("Image Flow conversion fallback", error);
      return {
        ext: originalExt,
        buffer: await file.arrayBuffer(),
        notice: `已保留 ${file.name} 原格式；浏览器无法解码并转换此图片。`
      };
    }
  }

  async drawToBlob(file, mime, quality) {
    const bitmap = await this.decodeImage(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable.");
    ctx.drawImage(bitmap, 0, 0);
    if (typeof bitmap.close === "function") bitmap.close();
    return await new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Canvas conversion failed.")), mime, quality);
    });
  }

  async decodeImage(file) {
    if (window.createImageBitmap) return await window.createImageBitmap(file);
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = reject;
        element.src = url;
      });
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  renderFilename(file, note, batchIndex, ext) {
    if (!this.plugin.settings.enableRenameTemplate) {
      return sanitizeFilename(stripExtension(file.name));
    }
    const now = new Date();
    const parts = formatDateParts(now);
    const values = {
      noteName: sanitizeFilename(stripExtension(note.name)),
      originalName: sanitizeFilename(stripExtension(file.name)),
      date: parts.date,
      time: parts.time,
      timestamp: parts.timestamp,
      index: String(batchIndex).padStart(2, "0"),
      ext
    };
    const rendered = this.plugin.settings.renameTemplate.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
    return sanitizeFilename(rendered.replace(new RegExp(`\\.${escapeRegExp(ext)}$`, "i"), ""));
  }

  async getDestinationFolder(note) {
    const mode = this.plugin.settings.assetFolderMode;
    if (mode === "custom" && this.plugin.settings.customAssetFolder.trim()) {
      return normalizePath(this.plugin.settings.customAssetFolder.trim());
    }
    if (mode === "current-note-folder") return folderOfPath(note.path);

    const configured = this.plugin.app.vault.getConfig?.("attachmentFolderPath");
    if (typeof configured === "string" && configured.trim()) {
      if (configured === "./") return folderOfPath(note.path);
      return normalizePath(configured.replace(/\$\{filename\}/g, stripExtension(note.name)));
    }
    return folderOfPath(note.path);
  }

  async ensureFolder(folder) {
    if (!folder) return;
    const existing = this.plugin.app.vault.getAbstractFileByPath(folder);
    if (existing) return;
    const segments = folder.split("/").filter(Boolean);
    let current = "";
    for (const segment of segments) {
      current = current ? `${current}/${segment}` : segment;
      if (!this.plugin.app.vault.getAbstractFileByPath(current)) {
        await this.plugin.app.vault.createFolder(current);
      }
    }
  }

  async uniquePath(folder, filename) {
    const base = stripExtension(filename);
    const ext = filename.split(".").pop();
    let index = 0;
    while (true) {
      const candidate = normalizePath(`${folder ? `${folder}/` : ""}${index === 0 ? filename : `${base}-${String(index + 1).padStart(2, "0")}.${ext}`}`);
      if (!this.plugin.app.vault.getAbstractFileByPath(candidate)) return candidate;
      index += 1;
    }
  }
}

class ImageMoveManager {
  constructor(plugin) {
    this.plugin = plugin;
    this.dragState = null;
    this.scanTimer = null;
    this.boundCapturePointerDown = null;
  }

  register() {
    this.plugin.registerMarkdownPostProcessor((el, ctx) => {
      if (!this.isEnabled()) return;
      this.decorateRoot(el, ctx.sourcePath);
    });

    this.plugin.registerEvent(this.plugin.app.workspace.on("active-leaf-change", () => this.scheduleScan()));
    this.plugin.registerEvent(this.plugin.app.workspace.on("layout-change", () => this.scheduleScan()));
    this.boundCapturePointerDown = evt => this.onCapturePointerDown(evt);
    document.addEventListener("pointerdown", this.boundCapturePointerDown, { capture: true });
    this.plugin.register(() => {
      if (this.boundCapturePointerDown) {
        document.removeEventListener("pointerdown", this.boundCapturePointerDown, { capture: true });
      }
    });
    this.scheduleScan();
  }

  unload() {
    if (this.scanTimer) {
      window.clearTimeout(this.scanTimer);
      this.scanTimer = null;
    }
    if (this.boundCapturePointerDown) {
      document.removeEventListener("pointerdown", this.boundCapturePointerDown, { capture: true });
      this.boundCapturePointerDown = null;
    }
    this.cleanupPointerDrag();
    this.dragState = null;
  }

  isEnabled() {
    return this.plugin.settings.enableImageDragMove ?? this.plugin.settings.enableCanvasPositioning ?? true;
  }

  scheduleScan(delay = 100) {
    if (this.scanTimer) window.clearTimeout(this.scanTimer);
    this.scanTimer = window.setTimeout(() => {
      this.scanTimer = null;
      this.scanActiveMarkdownViews();
    }, delay);
  }

  schedulePostMoveScan() {
    this.scheduleScan(50);
    window.setTimeout(() => this.scanActiveMarkdownViews(), 250);
    window.setTimeout(() => this.scanActiveMarkdownViews(), 600);
  }

  onCapturePointerDown(evt) {
    if (!this.isEnabled() || this.dragState) return;
    if (evt.button !== 0) return;
    const target = evt.target;
    if (!target?.closest) return;
    if (this.isSettingsUiTarget(target)) return;
    if (target.closest(".iflow-edit-source-button")) return;
    const embed = target.closest(".internal-embed.image-embed, .image-embed");
    if (!embed || embed.dataset.iflowMoveDecorated === "true" || !embed.querySelector("img")) return;

    const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || !view.file || !view.editor) return;
    const imagePath = this.getImagePathFromEmbed(embed);
    if (!imagePath) return;

    this.decorateEmbed(embed, view.file.path);
    this.startPointerDrag(evt, embed, view.file.path, imagePath);
  }

  isSettingsUiTarget(target) {
    return Boolean(target.closest(".modal.mod-settings, .setting, .hotkey-list-container, .hotkey-search-container"));
  }

  scanActiveMarkdownViews() {
    if (!this.isEnabled()) return;
    const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || !view.file) return;
    this.decorateRoot(view.containerEl, view.file.path);
  }

  decorateRoot(root, notePath) {
    const embeds = Array.from(root.querySelectorAll(".internal-embed.image-embed, .image-embed")).filter(embed => embed.querySelector("img"));
    embeds.forEach(embed => this.decorateEmbed(embed, notePath));
  }

  decorateEmbed(embed, notePath) {
    if (embed.dataset.iflowMoveDecorated === "true") return;
    const imagePath = this.getImagePathFromEmbed(embed);
    if (!imagePath) return;

    embed.dataset.iflowMoveDecorated = "true";
    embed.dataset.iflowImagePath = imagePath;
    embed.draggable = false;
    const img = embed.querySelector("img");
    if (img) {
      img.draggable = false;
      img.addEventListener("dragstart", evt => evt.preventDefault());
    }
    embed.addClass("iflow-movable");
    embed.setAttribute("title", "拖动图片到光标位置以移动");
    this.ensureEditButton(embed, imagePath);

    embed.addEventListener("dragstart", evt => evt.preventDefault());
    embed.addEventListener("pointerdown", evt => this.startPointerDrag(evt, embed, notePath, imagePath));
  }

  ensureEditButton(embed, imagePath) {
    if (embed.querySelector(".iflow-edit-source-button")) return;
    const button = document.createElement("button");
    button.className = "iflow-edit-source-button";
    button.type = "button";
    button.setAttribute("aria-label", "编辑图片链接");
    button.setAttribute("title", "编辑图片链接");
    setIcon(button, "code-2");
    button.addEventListener("pointerdown", evt => {
      evt.preventDefault();
      evt.stopPropagation();
    });
    button.addEventListener("click", evt => {
      evt.preventDefault();
      evt.stopPropagation();
      this.revealImageLinkInEditor(embed, imagePath);
    });
    embed.appendChild(button);
  }

  startPointerDrag(evt, embed, notePath, imagePath) {
    if (this.dragState) return;
    if (evt.button !== 0) return;
    if (evt.target?.closest?.(".iflow-edit-source-button")) return;
    if (this.isResizeGesture(evt, embed)) return;
    const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || !view.editor || !view.file) return;
    const match = this.findSingleImageMatch(view.editor, imagePath, embed);
    if (!match) {
      new Notice("未找到对应的图片链接，无法移动。");
      return;
    }
    this.dragState = {
      notePath: view.file.path,
      imagePath,
      link: match.fullMatch,
      start: match.start,
      end: match.end,
      completed: false,
      editor: view.editor,
      pointerId: evt.pointerId,
      preview: this.createFloatingPreview(match.fullMatch),
      lastTarget: view.editor.getCursor(),
      moved: false
    };
    evt.preventDefault();
    evt.stopPropagation();
    embed.setPointerCapture?.(evt.pointerId);
    embed.addClass("iflow-moving");
    this.updateFloatingPreview(evt.clientX, evt.clientY);
    this.boundPointerMove = event => this.onPointerMove(event);
    this.boundPointerUp = event => this.onPointerUp(event, embed);
    document.addEventListener("pointermove", this.boundPointerMove, { capture: true });
    document.addEventListener("pointerup", this.boundPointerUp, { capture: true, once: true });
    document.addEventListener("pointercancel", this.boundPointerUp, { capture: true, once: true });
  }

  isResizeGesture(evt, embed) {
    const target = evt.target;
    if (target?.closest?.(".image-resize-handle, .image-resize-corner, .resize-handle, .cm-widgetBuffer")) return true;
    const img = embed.querySelector("img");
    const rect = (img || embed).getBoundingClientRect();
    const edge = 18;
    const nearRight = rect.right - evt.clientX <= edge;
    const nearBottom = rect.bottom - evt.clientY <= edge;
    return nearRight || nearBottom;
  }

  createFloatingPreview(text) {
    const preview = document.createElement("div");
    preview.className = "iflow-drag-preview";
    preview.textContent = text;
    document.body.appendChild(preview);
    return preview;
  }

  updateFloatingPreview(clientX, clientY) {
    const preview = this.dragState?.preview;
    if (!preview) return;
    preview.style.left = `${clientX + 12}px`;
    preview.style.top = `${clientY + 12}px`;
  }

  onPointerMove(evt) {
    const drag = this.dragState;
    if (!drag || drag.pointerId !== evt.pointerId) return;
    evt.preventDefault();
    evt.stopPropagation();
    drag.moved = true;
    this.updateFloatingPreview(evt.clientX, evt.clientY);
    const target = this.getEditorPositionAtPointer(drag.editor, evt);
    if (target) {
      drag.lastTarget = target;
      drag.editor.setCursor(target);
      drag.editor.focus();
    }
  }

  async onPointerUp(evt, embed) {
    const drag = this.dragState;
    if (!drag || drag.pointerId !== evt.pointerId) return;
    evt.preventDefault();
    evt.stopPropagation();
    embed.removeClass("iflow-moving");
    const target = this.getEditorPositionAtPointer(drag.editor, evt) || drag.lastTarget || drag.editor.getCursor();
    this.cleanupPointerDrag(false);
    if (drag.moved) await this.moveDraggedImage(drag.editor, target, drag);
    else this.activateEditButton(embed);
  }

  activateEditButton(embed) {
    document.querySelectorAll(".iflow-movable.iflow-edit-active").forEach(active => {
      if (active !== embed) active.removeClass("iflow-edit-active");
    });
    embed.addClass("iflow-edit-active");
  }

  revealImageLinkInEditor(embed, imagePath) {
    const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || !view.editor || !view.file) return;
    const match = this.findSingleImageMatch(view.editor, imagePath, embed);
    if (!match) {
      new Notice("未找到对应的图片链接。");
      return;
    }
    view.editor.focus();
    view.editor.setSelection(match.start, match.end);
    view.editor.scrollIntoView({ from: match.start, to: match.end }, true);
  }

  cleanupPointerDrag(clearState = true) {
    document.removeEventListener("pointermove", this.boundPointerMove, { capture: true });
    document.removeEventListener("pointerup", this.boundPointerUp, { capture: true });
    document.removeEventListener("pointercancel", this.boundPointerUp, { capture: true });
    this.dragState?.preview?.remove();
    this.boundPointerMove = null;
    this.boundPointerUp = null;
    if (clearState) this.dragState = null;
  }

  getEditorPositionAtPointer(editor, evt) {
    if (typeof editor.posAtMouse === "function") {
      const pos = editor.posAtMouse(evt);
      if (pos) return pos;
    }
    try {
      const cm = editor.cm;
      if (cm?.posAtCoords) {
        const pos = cm.posAtCoords({ x: evt.clientX, y: evt.clientY });
        if (pos) return { line: pos.line, ch: pos.ch };
      }
    } catch {}
    return null;
  }

  async moveDraggedImage(editor, target, explicitDrag = null) {
    const drag = explicitDrag || this.dragState;
    if (!drag || drag.completed) return;
    drag.completed = true;
    this.dragState = null;

    const activeFile = this.plugin.app.workspace.getActiveFile();
    if (!(activeFile instanceof TFile) || activeFile.path !== drag.notePath) {
      new Notice("只能在同一篇笔记内移动图片。");
      return;
    }

    const latest = this.findSingleImageMatch(editor, drag.imagePath, null);
    if (latest) {
      drag.start = latest.start;
      drag.end = latest.end;
      drag.link = latest.fullMatch;
    }

    const startOffset = this.posToOffset(editor, drag.start);
    const endOffset = this.posToOffset(editor, drag.end);
    let targetOffset = this.posToOffset(editor, target);
    if (targetOffset === null || startOffset === null || endOffset === null) {
      new Notice("无法定位光标位置，移动失败。");
      return;
    }

    if (targetOffset >= startOffset && targetOffset <= endOffset) {
      return;
    }
    if (targetOffset > endOffset) targetOffset -= endOffset - startOffset;

    const adjustedTarget = this.offsetToPos(editor, Math.max(0, targetOffset));
    editor.replaceRange("", drag.start, drag.end);
    editor.replaceRange(drag.link, adjustedTarget);
    editor.setCursor({
      line: adjustedTarget.line,
      ch: adjustedTarget.ch + drag.link.length
    });
    this.schedulePostMoveScan();
  }

  posToOffset(editor, pos) {
    if (typeof editor.posToOffset === "function") return editor.posToOffset(pos);
    let offset = 0;
    for (let line = 0; line < pos.line; line += 1) offset += editor.getLine(line).length + 1;
    return offset + pos.ch;
  }

  offsetToPos(editor, offset) {
    if (typeof editor.offsetToPos === "function") return editor.offsetToPos(offset);
    let remaining = offset;
    for (let line = 0; line < editor.lineCount(); line += 1) {
      const length = editor.getLine(line).length;
      if (remaining <= length) return { line, ch: remaining };
      remaining -= length + 1;
    }
    const lastLine = Math.max(0, editor.lineCount() - 1);
    return { line: lastLine, ch: editor.getLine(lastLine).length };
  }

  getImagePathFromEmbed(embed) {
    if (!embed) return null;
    const source = embed.getAttribute("src") || embed.dataset?.src || embed.querySelector("img")?.getAttribute("alt") || "";
    const direct = this.resolvePath(source);
    if (direct) return direct;
    const img = embed.querySelector("img");
    const src = img?.getAttribute("src") || "";
    return this.resolvePath(src);
  }

  resolvePath(value) {
    if (!value) return null;
    const clean = decodeURIComponent(value.split("?")[0].split("#")[0]);
    const direct = this.plugin.app.vault.getAbstractFileByPath(clean);
    if (direct instanceof TFile) return direct.path;
    const filename = clean.split("/").pop();
    if (!filename) return null;
    const found = this.plugin.app.vault.getFiles().find(file => file.name === filename);
    return found?.path || null;
  }

  findSingleImageMatch(editor, imagePath, embed) {
    const matches = this.findImageMatches(editor, imagePath);
    if (matches.length === 0) return null;
    if (matches.length === 1) return matches[0];
    try {
      const cm = editor.cm;
      if (cm?.posAtDOM && embed) {
        const pos = cm.posAtDOM(embed);
        if (pos) {
          const nearby = matches
            .map(match => ({ match, distance: Math.abs(match.start.line - pos.line) }))
            .sort((a, b) => a.distance - b.distance)[0];
          if (nearby) return nearby.match;
        }
      }
    } catch {}
    return matches[0];
  }

  findImageMatches(editor, imagePath) {
    const matches = [];
    const filename = imagePath.split("/").pop()?.toLowerCase() || "";
    const basename = filename.replace(/\.[^.]+$/, "");
    const pathLower = imagePath.toLowerCase();
    const regex = /!\[\[([^\]|#]+(?:#[^\]|]+)?)(?:\|[^\]]*)?\]\]/g;

    for (let line = 0; line < editor.lineCount(); line += 1) {
      const text = editor.getLine(line);
      let match;
      while ((match = regex.exec(text)) !== null) {
        const target = match[1].split("#")[0].trim();
        const targetLower = target.toLowerCase();
        const targetName = targetLower.split("/").pop() || "";
        const targetBase = targetName.replace(/\.[^.]+$/, "");
        if (targetLower === pathLower || targetName === filename || targetBase === basename) {
          matches.push({
            fullMatch: match[0],
            start: { line, ch: match.index },
            end: { line, ch: match.index + match[0].length }
          });
        }
      }
    }
    return matches;
  }
}

class ImageLibraryView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.images = [];
    this.query = "";
    this.folder = "";
    this.selectionMode = false;
    this.selectedPaths = new Set();
    this.sort = `${plugin.settings.imageManagerDefaultSortField}-${plugin.settings.imageManagerDefaultSortOrder}`;
    this.isLoading = false;
    this.renderToken = 0;
    this.renderTimer = null;
    this.refreshTimer = null;
    this.referenceCounts = new Map();
    this.referenceCache = new Map();
    this.filteredImages = [];
    this.renderedCount = 0;
    this.isLoadingMore = false;
    this.activeImageLoads = 0;
    this.imageLoadQueue = [];
    this.intersectionObserver = null;
    this.imageLoadToken = 0;
    this.imageLoader = new ImageFlowImageLoader(plugin.app);
    this.boundHandleScroll = () => this.handleScroll();
    this.searchDebounced = debounceFn(value => {
      this.query = value.trim();
      this.applyFilters();
      this.renderGrid(false);
    }, 300);
  }

  syncDefaultSort() {
    if (!this.sort) {
      this.sort = `${this.plugin.settings.imageManagerDefaultSortField}-${this.plugin.settings.imageManagerDefaultSortOrder}`;
    }
  }

  getViewType() {
    return VIEW_TYPE_LIBRARY;
  }

  getDisplayText() {
    return "图片流";
  }

  getIcon() {
    return "images";
  }

  async onOpen() {
    this.render();
    this.registerEvent(this.plugin.app.vault.on("create", () => this.scheduleRefresh()));
    this.registerEvent(this.plugin.app.vault.on("delete", () => this.scheduleRefresh()));
    this.registerEvent(this.plugin.app.vault.on("rename", () => this.scheduleRefresh()));
  }

  async onClose() {
    this.cancelPendingRender();
    this.cancelScheduledRefresh();
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
    this.gridContainer?.removeEventListener("scroll", this.boundHandleScroll);
    this.closeFolderSuggestions();
    this.containerEl.children[1]?.empty();
  }

  render() {
    const root = this.containerEl.children[1];
    root.empty();
    root.addClass("iflow-library");
    root.addClass("image-manager-container");
    this.setupLayout(root);
    if (this.stats) this.stats.setText("图库准备中...");
    this.scheduleRefresh(100);
  }

  setupLayout(root) {
    this.headerContainer = root.createDiv({ cls: "image-manager-header" });
    this.renderHeader();
    this.searchContainer = root.createDiv({ cls: "image-manager-search" });
    this.renderSearchBar();
    this.gridContainer = root.createDiv({ cls: "image-manager-grid-panel" });
    this.gridContainer.addEventListener("scroll", this.boundHandleScroll);
  }

  renderHeader() {
    if (!this.headerContainer) return;
    this.headerContainer.empty();
    const topRow = this.headerContainer.createDiv({ cls: "image-manager-header-row" });
    const left = topRow.createDiv({ cls: "image-manager-header-left" });
    const right = topRow.createDiv({ cls: "image-manager-header-right" });

    const folder = left.createEl("input", { cls: "iflow-library-folder image-manager-folder-input", attr: { type: "text", placeholder: "选择或输入文件夹路径" } });
    this.folderInput = folder;
    folder.value = this.folder;
    folder.addEventListener("input", () => {
      this.showFolderSuggestions(folder, folder.value);
    });
    folder.addEventListener("focus", () => this.showFolderSuggestions(folder, folder.value));
    folder.addEventListener("blur", () => {
      window.setTimeout(() => this.closeFolderSuggestions(), 120);
    });
    folder.addEventListener("keydown", evt => {
      if (evt.key === "Enter") {
        evt.preventDefault();
        this.folder = normalizeOptionalFolderPath(folder.value);
        folder.value = this.folder;
        this.closeFolderSuggestions();
        this.refreshResults();
      }
      if (evt.key === "Escape") {
        evt.preventDefault();
        this.closeFolderSuggestions();
      }
    });

    const clearFolder = left.createEl("button", { cls: "iflow-icon-button", attr: { type: "button", "aria-label": "清空文件夹筛选" } });
    setIcon(clearFolder, "x");
    setTooltip(clearFolder, "清空文件夹筛选");
    clearFolder.addEventListener("click", () => {
      this.folder = "";
      folder.value = "";
      this.closeFolderSuggestions();
      this.refreshResults();
    });

    this.stats = left.createSpan({ cls: "iflow-library-stats image-manager-stats" });

    const batchDelete = right.createEl("button", { cls: "iflow-icon-button iflow-danger-button", attr: { type: "button", "aria-label": "删除选中图片" } });
    this.batchDeleteButton = batchDelete;
    setIcon(batchDelete, "trash-2");
    setTooltip(batchDelete, "删除选中图片");
    batchDelete.addEventListener("click", () => this.deleteSelectedImages());

    const multiSelect = right.createEl("button", { cls: "iflow-icon-button", attr: { type: "button", "aria-label": "多选" } });
    this.multiSelectButton = multiSelect;
    setIcon(multiSelect, "check-square");
    setTooltip(multiSelect, "多选");
    multiSelect.addEventListener("click", () => {
      this.selectionMode = !this.selectionMode;
      if (!this.selectionMode) this.selectedPaths.clear();
      this.refreshResults();
    });

    const refresh = right.createEl("button", { cls: "iflow-icon-button", attr: { type: "button", "aria-label": "刷新图库" } });
    setIcon(refresh, "refresh-cw");
    setTooltip(refresh, "刷新图库");
    refresh.addEventListener("click", () => {
      this.closeFolderSuggestions();
      this.refreshResults();
    });
  }

  renderSearchBar() {
    if (!this.searchContainer) return;
    this.searchContainer.empty();
    const searchRow = this.searchContainer.createDiv({ cls: "image-manager-search-sort-bar" });
    const searchBox = searchRow.createDiv({ cls: "image-manager-search-box" });
    const search = searchBox.createEl("input", { cls: "iflow-library-search image-manager-search-input", attr: { type: "search", placeholder: "搜索图片名称或路径" } });
    this.searchInput = search;
    search.value = this.query;
    search.addEventListener("input", () => {
      this.searchDebounced(search.value);
    });

    const clearSearch = searchBox.createEl("button", { cls: "iflow-icon-button image-manager-clear-search-button", attr: { type: "button", "aria-label": "清空搜索" } });
    setIcon(clearSearch, "x");
    setTooltip(clearSearch, "清空搜索");
    clearSearch.addEventListener("click", () => {
      this.query = "";
      search.value = "";
      this.applyFilters();
      this.renderGrid(false);
    });

    const sortControls = searchRow.createDiv({ cls: "image-manager-sort-controls" });
    const sort = sortControls.createEl("select", { cls: "iflow-library-sort" });
    [
      ["mtime-desc", "修改时间：最新"],
      ["mtime-asc", "修改时间：最早"],
      ["name-asc", "名称：A-Z"],
      ["name-desc", "名称：Z-A"],
      ["size-desc", "大小：从大到小"],
      ["size-asc", "大小：从小到大"]
    ].forEach(([value, label]) => sort.createEl("option", { text: label, value }));
    sort.value = this.sort;
    sort.addEventListener("change", () => {
      this.sort = sort.value;
      this.applyFilters();
      this.renderGrid(false);
    });
  }

  refreshResults() {
    if (!this.gridContainer) return;
    this.cancelPendingRender();
    this.cancelScheduledRefresh();
    this.loadImages();
  }

  loadImages() {
    if (!this.gridContainer || this.isLoading) return;
    this.isLoading = true;
    this.renderGrid(false);
    try {
      this.images = this.getAllImages();
      this.applyFilters();
      this.renderHeader();
      this.renderSearchBar();
    } catch (error) {
      console.error("Image Flow library load failed", error);
      new Notice(`加载图片失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      this.isLoading = false;
      this.renderGrid(false);
    }
  }

  applyFilters() {
    const images = this.getImages(this.images);
    this.filteredImages = images;
    const visiblePaths = new Set(images.map(image => image.path));
    Array.from(this.selectedPaths).forEach(path => {
      if (!visiblePaths.has(path)) this.selectedPaths.delete(path);
    });
  }

  renderGrid(append = false) {
    if (!this.gridContainer) return;
    if (!append) {
      this.cancelPendingRender();
      this.renderedCount = 0;
      this.isLoadingMore = false;
      this.gridContainer.empty();
      this.grid = null;
    }
    this.referenceCounts = new Map();
    if (this.isLoading && !append) {
      this.gridContainer.empty();
      const loading = this.gridContainer.createDiv({ cls: "image-manager-loading-state" });
      loading.createDiv({ cls: "image-manager-loading-spinner" });
      loading.createSpan({ text: "加载中..." });
      return;
    }
    const allCount = this.images.length;
    const images = this.filteredImages;
    if (this.multiSelectButton) {
      this.multiSelectButton.classList.toggle("is-active", this.selectionMode);
    }
    if (this.batchDeleteButton) {
      this.batchDeleteButton.disabled = !this.selectionMode || this.selectedPaths.size === 0;
      this.batchDeleteButton.classList.toggle("is-disabled", this.batchDeleteButton.disabled);
    }
    if (this.stats) {
      const countText = allCount === images.length ? `${images.length} 张图片` : `${images.length} / ${allCount} 张图片`;
      const selectedText = this.selectionMode ? ` · 已选 ${this.selectedPaths.size}` : "";
      this.stats.setText(`${countText}${selectedText}`);
    }
    if (images.length === 0) {
      this.gridContainer.empty();
      const empty = this.gridContainer.createDiv({ cls: "iflow-empty image-manager-empty-state" });
      empty.createDiv({ text: allCount > 0 ? "当前筛选条件下未找到图片。" : "未找到图片。" });
      this.renderScanDebug(empty);
      return;
    }
    this.renderNextImageBatch(append);
  }

  scheduleRefresh(delay = 200) {
    this.cancelScheduledRefresh();
    this.refreshTimer = window.setTimeout(() => {
      this.refreshTimer = null;
      this.refreshResults();
    }, delay);
  }

  cancelScheduledRefresh() {
    if (this.refreshTimer) {
      window.clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  cancelPendingRender() {
    this.renderToken += 1;
    if (this.renderTimer) {
      window.cancelAnimationFrame(this.renderTimer);
      this.renderTimer = null;
    }
    this.imageLoadQueue = [];
    this.activeImageLoads = 0;
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
    this.imageLoadToken += 1;
  }

  handleScroll() {
    if (!this.gridContainer || this.isLoadingMore || this.renderedCount >= this.filteredImages.length) return;
    const remaining = this.gridContainer.scrollHeight - this.gridContainer.scrollTop - this.gridContainer.clientHeight;
    if (remaining < LIBRARY_SCROLL_THRESHOLD) this.loadMoreImages();
  }

  loadMoreImages() {
    if (this.isLoadingMore || this.renderedCount >= this.filteredImages.length) return;
    this.isLoadingMore = true;
    this.renderGrid(true);
  }

  renderNextImageBatch(append = true) {
    if (!this.gridContainer) return;
    const token = this.renderToken;
    const start = this.renderedCount;
    const end = Math.min(start + LIBRARY_RENDER_BATCH_SIZE, this.filteredImages.length);
    const batch = this.filteredImages.slice(start, end);

    this.renderTimer = window.requestAnimationFrame(() => {
      this.renderTimer = null;
      if (!this.gridContainer || token !== this.renderToken) return;
      let grid = append ? this.gridContainer.querySelector(".image-manager-grid") : null;
      if (!append) this.gridContainer.empty();
      if (!grid) grid = this.gridContainer.createDiv({ cls: "iflow-grid image-manager-grid" });
      this.grid = grid;
      this.removeLoadMoreIndicator();
      const renderedItems = this.renderImageBatch(grid, batch);
      this.renderedCount = end;
      this.isLoadingMore = false;
      this.updateLoadMoreIndicator();
      window.requestAnimationFrame(() => {
        if (this.renderedCount < this.filteredImages.length && this.gridContainer?.scrollHeight <= this.gridContainer?.clientHeight) {
          this.loadMoreImages();
        }
      });
      if (this.stats) {
        const selectedText = this.selectionMode ? ` · 已选 ${this.selectedPaths.size}` : "";
        this.stats.setText(`${this.filteredImages.length} 张图片 · 已显示 ${this.renderedCount}${selectedText}`);
      }
      this.scheduleBatchReferenceCheck(renderedItems);
    });
  }

  renderImageBatch(grid, images) {
    const renderedItems = [];
    images.forEach(image => {
      const element = this.renderCard(grid, image);
      renderedItems.push({ image, element });
    });
    return renderedItems;
  }

  removeLoadMoreIndicator() {
    this.gridContainer?.querySelector(".image-manager-load-more")?.remove();
  }

  updateLoadMoreIndicator() {
    if (!this.gridContainer) return;
    this.removeLoadMoreIndicator();
    if (this.renderedCount >= this.filteredImages.length) return;
    const indicator = this.gridContainer.createDiv({ cls: "image-manager-load-more" });
    indicator.setText(`已显示 ${this.renderedCount} / ${this.filteredImages.length} 张图片，点击加载更多`);
    indicator.addEventListener("click", () => this.loadMoreImages());
  }

  renderScanDebug(container) {
    const info = this.imageLoader.lastScanInfo || {};
    const details = container.createDiv({ cls: "iflow-scan-debug" });
    const folder = info.selectedFolder || "全库";
    const excluded = Array.isArray(info.excludedFolders) ? info.excludedFolders : [];
    details.createDiv({ text: `扫描文件：${info.totalFiles ?? 0}，识别图片：${info.imageFiles ?? 0}` });
    details.createDiv({ text: `文件夹筛选：${folder}` });
    details.createDiv({ text: `排除路径：${excluded.length ? excluded.join("、") : "无"}` });
  }

  showFolderSuggestions(input, value) {
    this.closeFolderSuggestions();
    const keyword = value.trim().toLowerCase();
    const options = this.getFolderOptions()
      .filter(path => !keyword || path.toLowerCase().includes(keyword))
      .slice(0, 12);
    if (options.length === 0) return;

    const rect = input.getBoundingClientRect();
    const suggestions = document.body.createDiv({ cls: "iflow-folder-suggestions" });
    Object.assign(suggestions.style, {
      left: `${rect.left}px`,
      top: `${rect.bottom + 4}px`,
      width: `${rect.width}px`
    });
    this.folderSuggestions = suggestions;

    options.forEach(path => {
      const item = suggestions.createDiv({ cls: "iflow-folder-suggestion", text: path });
      item.addEventListener("mousedown", evt => {
        evt.preventDefault();
        evt.stopPropagation();
        this.folder = normalizeOptionalFolderPath(path);
        input.value = this.folder;
        this.closeFolderSuggestions();
        this.refreshResults();
      });
    });
  }

  closeFolderSuggestions() {
    if (this.folderSuggestions) {
      this.folderSuggestions.remove();
      this.folderSuggestions = null;
    }
  }

  renderCard(grid, image, referenceCount = 0) {
    const file = image.originalFile || image;
    const displayFile = image.displayFile || file;
    const card = grid.createDiv({ cls: "iflow-card image-manager-grid-item" });
    card.setAttribute("data-path", file.path);
    card.classList.toggle("is-selected", this.selectedPaths.has(file.path));
    card.classList.toggle("image-manager-item-selected", this.selectedPaths.has(file.path));
    if (this.selectionMode) {
      const selector = card.createEl("label", { cls: "iflow-card-selector" });
      const checkbox = selector.createEl("input", { attr: { type: "checkbox" } });
      checkbox.checked = this.selectedPaths.has(file.path);
      selector.createSpan();
      checkbox.addEventListener("change", evt => {
        evt.stopPropagation();
        this.toggleSelected(file.path, checkbox.checked);
      });
      selector.addEventListener("click", evt => evt.stopPropagation());
    }

    const thumb = card.createDiv({ cls: "iflow-thumb image-manager-thumbnail" });
    this.renderReferenceBadge(thumb, this.referenceCache.get(file.path));
    thumb.createDiv({ cls: "image-manager-format-badge", text: formatLabelFromExt(extOfFile(displayFile)) });
    const img = thumb.createEl("img", { cls: "image-manager-thumbnail-image", attr: { alt: file.name, loading: "lazy" } });
    img.setAttribute("data-src", this.imageLoader.getImageResourcePath(image));
    this.observeThumbnail(thumb);
    thumb.addEventListener("click", () => {
      if (this.selectionMode) {
        this.toggleSelected(file.path, !this.selectedPaths.has(file.path));
        return;
      }
      new ImagePreviewModal(this.plugin.app, this.plugin, file, this.findReferences(file)).open();
    });

    const body = card.createDiv({ cls: "iflow-card-body image-manager-image-info" });
    const actions = body.createDiv({ cls: "iflow-card-actions image-manager-image-actions" });
    const copy = actions.createEl("button", { cls: "iflow-icon-button image-manager-action-button", attr: { type: "button", "aria-label": "复制嵌入链接" } });
    setIcon(copy, "copy");
    setTooltip(copy, "复制嵌入链接");
    copy.addEventListener("click", async evt => {
      evt.preventDefault();
      evt.stopPropagation();
      await copyText(await this.plugin.getEmbedLink(file.path));
      new Notice("已复制图片嵌入链接。");
    });

    const open = actions.createEl("button", { cls: "iflow-icon-button image-manager-action-button image-manager-open-button", attr: { type: "button", "aria-label": "打开源文件" } });
    setIcon(open, "folder-open");
    setTooltip(open, "打开源文件");
    open.addEventListener("click", evt => {
      evt.preventDefault();
      evt.stopPropagation();
      this.plugin.app.openWithDefaultApp(file.path);
    });

    const rename = actions.createEl("button", { cls: "iflow-icon-button image-manager-action-button image-manager-rename-button", attr: { type: "button", "aria-label": "重命名" } });
    setIcon(rename, "pencil");
    setTooltip(rename, "重命名");
    rename.addEventListener("click", evt => {
      evt.preventDefault();
      evt.stopPropagation();
      this.renameImage(file);
    });

    const move = actions.createEl("button", { cls: "iflow-icon-button image-manager-action-button", attr: { type: "button", "aria-label": "移动" } });
    setIcon(move, "folder-input");
    setTooltip(move, "移动");
    move.addEventListener("click", evt => {
      evt.preventDefault();
      evt.stopPropagation();
      this.moveImage(file);
    });

    const remove = actions.createEl("button", { cls: "iflow-icon-button iflow-danger-button image-manager-action-button image-manager-delete-button", attr: { type: "button", "aria-label": "删除" } });
    setIcon(remove, "trash-2");
    setTooltip(remove, "删除");
    remove.addEventListener("click", evt => {
      evt.preventDefault();
      evt.stopPropagation();
      this.deleteImage(file);
    });

    body.createDiv({ cls: "iflow-card-name image-manager-image-name", text: file.name });
    const meta = body.createDiv({ cls: "iflow-card-meta image-manager-image-meta" });
    if (this.plugin.settings.imageManagerShowFileSize) {
      meta.createSpan({ cls: "image-manager-meta-item image-manager-meta-size", text: formatBytes(image.stat?.size ?? file.stat.size) });
    }
    if (this.plugin.settings.imageManagerShowModifiedTime) {
      meta.createSpan({ cls: "image-manager-meta-item image-manager-meta-date", text: new Date(image.stat?.mtime ?? file.stat.mtime).toLocaleDateString() });
    }
    return card;
  }

  scheduleBatchReferenceCheck(renderedItems) {
    const token = this.renderToken;
    const run = () => this.checkBatchReferences(renderedItems, token);
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(run, { timeout: 2000 });
    } else {
      window.setTimeout(run, 80);
    }
  }

  async checkBatchReferences(renderedItems, token) {
    const pending = renderedItems.filter(item => !this.referenceCache.has(item.image.path));
    for (let index = 0; index < pending.length; index += 10) {
      if (token !== this.renderToken) return;
      const batch = pending.slice(index, index + 10);
      batch.forEach(({ image, element }) => {
        const file = image.originalFile || image;
        const references = this.findReferences(file);
        this.referenceCache.set(image.path, references.length);
        this.updateReferenceDisplay(image.path, references.length, element);
      });
      if (index + 10 < pending.length) {
        await new Promise(resolve => window.setTimeout(resolve, 10));
      }
    }
  }

  renderReferenceBadge(container, count) {
    const badge = container.createDiv({ cls: "image-manager-reference-badge" });
    if (typeof count !== "number") {
      badge.addClass("image-manager-reference-badge-pending");
      badge.setText("检查中");
      return;
    }
    if (count > 0) {
      badge.addClass("image-manager-reference-badge-has-refs");
      badge.setText(`${count} 引用`);
    } else {
      badge.addClass("image-manager-reference-badge-no-refs");
      badge.setText("未引用");
    }
  }

  updateReferenceDisplay(path, count, element = null) {
    const card = element || this.gridContainer?.querySelector(`[data-path="${CSS.escape(path)}"]`);
    const thumb = card?.querySelector(".image-manager-thumbnail");
    if (!thumb) return;
    thumb.querySelector(".image-manager-reference-badge")?.remove();
    this.renderReferenceBadge(thumb, count);
  }

  setupIntersectionObserver() {
    if (this.intersectionObserver || !this.gridContainer) return;
    this.intersectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const thumb = entry.target;
        const img = thumb.querySelector("img[data-src]");
        if (img) {
          this.enqueueImageLoad(img);
          this.intersectionObserver?.unobserve(thumb);
        }
      });
    }, {
      root: this.gridContainer,
      rootMargin: "200px 0px"
    });
  }

  observeThumbnail(thumb) {
    this.setupIntersectionObserver();
    this.intersectionObserver?.observe(thumb);
  }

  enqueueImageLoad(img) {
    const token = this.imageLoadToken;
    const load = () => {
      if (token !== this.imageLoadToken) return;
      const src = img.getAttribute("data-src");
      if (!src) return;
      if (!img.isConnected) {
        this.processImageLoadQueue();
        return;
      }
      this.activeImageLoads += 1;
      img.removeAttribute("data-src");
      let timeout = null;
      let finished = false;
      const done = () => {
        if (finished) return;
        finished = true;
        if (timeout) window.clearTimeout(timeout);
        this.activeImageLoads = Math.max(0, this.activeImageLoads - 1);
        if (token === this.imageLoadToken) this.processImageLoadQueue();
      };
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
      timeout = window.setTimeout(done, 15000);
      img.src = src;
    };
    if (this.activeImageLoads < LIBRARY_MAX_CONCURRENT_IMAGE_LOADS) load();
    else this.imageLoadQueue.push(load);
  }

  processImageLoadQueue() {
    while (this.imageLoadQueue.length > 0 && this.activeImageLoads < LIBRARY_MAX_CONCURRENT_IMAGE_LOADS) {
      const load = this.imageLoadQueue.shift();
      load?.();
    }
  }

  toggleSelected(path, selected) {
    if (selected) this.selectedPaths.add(path);
    else this.selectedPaths.delete(path);
    this.refreshResults();
  }

  renameImage(file) {
    new TextInputModal(this.plugin.app, {
      title: "重命名图片",
      label: "文件名",
      placeholder: file.name,
      value: file.name,
      cta: "重命名",
      onSubmit: async value => {
        const nextName = this.normalizeFilenameInput(value, file.extension);
        if (!nextName || nextName === file.name) return;
        const targetPath = normalizePath(`${folderOfPath(file.path) ? `${folderOfPath(file.path)}/` : ""}${nextName}`);
        if (this.plugin.app.vault.getAbstractFileByPath(targetPath)) {
          new Notice("已存在同名文件。");
          return;
        }
        await this.plugin.app.fileManager.renameFile(file, targetPath);
        this.selectedPaths.delete(file.path);
        new Notice("图片已重命名。");
        this.refreshResults();
      }
    }).open();
  }

  moveImage(file) {
    new TextInputModal(this.plugin.app, {
      title: "移动图片",
      label: "目标文件夹路径",
      placeholder: "例如：assets/images",
      value: folderOfPath(file.path),
      cta: "移动",
      onSubmit: async value => {
        const folder = normalizePath(value.trim());
        await this.ensureFolder(folder);
        const targetPath = normalizePath(`${folder ? `${folder}/` : ""}${file.name}`);
        if (targetPath === file.path) return;
        if (this.plugin.app.vault.getAbstractFileByPath(targetPath)) {
          new Notice("目标文件夹中已存在同名文件。");
          return;
        }
        await this.plugin.app.fileManager.renameFile(file, targetPath);
        this.selectedPaths.delete(file.path);
        new Notice("图片已移动。");
        this.refreshResults();
      }
    }).open();
  }

  async deleteImage(file) {
    if (!window.confirm(`确定删除图片「${file.name}」吗？`)) return;
    await this.plugin.app.fileManager.trashFile(file);
    this.selectedPaths.delete(file.path);
    new Notice("图片已删除。");
    this.refreshResults();
  }

  async deleteSelectedImages() {
    if (!this.selectionMode || this.selectedPaths.size === 0) return;
    const selected = Array.from(this.selectedPaths)
      .map(path => this.plugin.app.vault.getAbstractFileByPath(path))
      .filter(file => file instanceof TFile);
    if (selected.length === 0) return;
    if (!window.confirm(`确定删除选中的 ${selected.length} 张图片吗？`)) return;
    for (const file of selected) {
      await this.plugin.app.fileManager.trashFile(file);
    }
    this.selectedPaths.clear();
    new Notice(`已删除 ${selected.length} 张图片。`);
    this.refreshResults();
  }

  findReferences(file) {
    const refs = [];
    const backlinks = this.plugin.app.metadataCache.getBacklinksForFile(file);
    if (!backlinks?.data) return refs;
    for (const [path, entries] of backlinks.data) {
      const source = this.plugin.app.vault.getAbstractFileByPath(path);
      if (!(source instanceof TFile)) continue;
      for (const entry of entries) {
        refs.push({
          file: source,
          position: entry.position,
          type: entry.link?.startsWith("!") ? "embed" : "link"
        });
      }
    }
    return refs;
  }

  normalizeFilenameInput(value, fallbackExt) {
    const trimmed = value.trim();
    if (!trimmed) return "";
    const cleaned = sanitizeFilename(trimmed);
    return /\.[^/.]+$/.test(cleaned) ? cleaned : `${cleaned}.${fallbackExt}`;
  }

  async ensureFolder(folder) {
    if (!folder) return;
    const existing = this.plugin.app.vault.getAbstractFileByPath(folder);
    if (existing instanceof TFolder) return;
    if (existing) throw new Error("目标路径不是文件夹。");
    const segments = folder.split("/").filter(Boolean);
    let current = "";
    for (const segment of segments) {
      current = current ? `${current}/${segment}` : segment;
      if (!this.plugin.app.vault.getAbstractFileByPath(current)) {
        await this.plugin.app.vault.createFolder(current);
      }
    }
  }

  getImages(images = this.getAllImages()) {
    const query = this.query.trim().toLowerCase();
    const filtered = images.filter(image => {
      if (query && !image.path.toLowerCase().includes(query) && !image.name.toLowerCase().includes(query)) return false;
      return true;
    });
    return this.sortImages(filtered);
  }

  sortImages(images) {
    const [field, direction] = this.sort.split("-");
    images.sort((a, b) => {
      let result = 0;
      if (field === "name") result = a.name.localeCompare(b.name);
      if (field === "size") result = a.stat.size - b.stat.size;
      if (field === "mtime") result = a.stat.mtime - b.stat.mtime;
      return direction === "desc" ? -result : result;
    });
    return images;
  }

  getAllImages() {
    this.imageLoader.setExcludedFolders(this.getExcludedFolderPaths());
    return this.imageLoader.loadImages(this.folder);
  }

  getFolderOptions() {
    return this.plugin.app.vault.getAllLoadedFiles()
      .filter(file => file instanceof TFolder && file.path)
      .map(folder => folder.path)
      .sort((a, b) => a.localeCompare(b));
  }

  getExcludedFolderPaths() {
    return parseFolderPathList(this.plugin.settings.imageManagerExcludedFolderPaths);
  }

}

class TextInputModal extends Modal {
  constructor(app, options) {
    super(app);
    this.options = options;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.titleEl.setText(this.options.title);

    let input;
    const submit = async () => {
      if (!input) return;
      try {
        await this.options.onSubmit(input.value);
        this.close();
      } catch (error) {
        console.error("Image Flow action failed", error);
        new Notice(error instanceof Error ? error.message : "操作失败。");
      }
    };

    new Setting(contentEl)
      .setName(this.options.label)
      .addText(text => {
        input = text.inputEl;
        text
          .setPlaceholder(this.options.placeholder || "")
          .setValue(this.options.value || "")
          .onChange(() => {});
        input.addEventListener("keydown", evt => {
          if (evt.key === "Enter") {
            evt.preventDefault();
            submit();
          }
        });
      });

    new Setting(contentEl)
      .addButton(button => button
        .setButtonText("取消")
        .onClick(() => this.close()))
      .addButton(button => button
        .setButtonText(this.options.cta || "确定")
        .setCta()
        .onClick(submit));

    window.setTimeout(() => input?.focus(), 50);
  }
}

class ImagePreviewModal extends Modal {
  constructor(app, plugin, file, references = []) {
    super(app);
    this.plugin = plugin;
    this.file = file;
    this.references = references;
  }

  onOpen() {
    this.contentEl.empty();
    this.modalEl.addClass("image-manager-preview-modal-container");
    this.titleEl.setText("");

    const shell = this.contentEl.createDiv({ cls: "image-manager-preview-modal" });
    const toolbar = shell.createDiv({ cls: "image-manager-preview-toolbar" });
    const title = toolbar.createDiv({ cls: "image-manager-preview-title" });
    title.createSpan({ text: this.file.name });
    title.createSpan({ cls: "image-manager-format-tag image-manager-other-format-tag", text: formatLabelFromExt(extOfFile(this.file)) });
    if (this.references.length > 0) {
      title.createSpan({ cls: "image-manager-reference-tag", text: `${this.references.length} 个引用` });
    }

    const controls = toolbar.createDiv({ cls: "image-manager-preview-controls" });
    const copy = controls.createEl("button", { cls: "iflow-icon-button", attr: { type: "button", "aria-label": "复制嵌入链接" } });
    setIcon(copy, "copy");
    setTooltip(copy, "复制嵌入链接");
    copy.addEventListener("click", async () => {
      await copyText(await this.plugin.getEmbedLink(this.file.path));
      new Notice("已复制图片嵌入链接。");
    });
    const open = controls.createEl("button", { cls: "iflow-icon-button", attr: { type: "button", "aria-label": "打开源文件" } });
    setIcon(open, "external-link");
    setTooltip(open, "打开源文件");
    open.addEventListener("click", () => this.app.openWithDefaultApp(this.file.path));
    const close = controls.createEl("button", { cls: "iflow-icon-button", attr: { type: "button", "aria-label": "关闭" } });
    setIcon(close, "x");
    setTooltip(close, "关闭");
    close.addEventListener("click", () => this.close());

    const content = shell.createDiv({ cls: "image-manager-preview-content" });
    const imageSection = content.createDiv({ cls: "image-manager-preview-image-section" });
    const imageContainer = imageSection.createDiv({ cls: "image-manager-preview-image-container" });
    const img = imageContainer.createEl("img", {
      cls: "image-manager-preview-image",
      attr: { src: this.app.vault.getResourcePath(this.file), alt: this.file.name }
    });
    img.addEventListener("load", () => img.addClass("is-loaded"));

    const infoSection = content.createDiv({ cls: "image-manager-preview-info-section" });
    this.renderDetails(infoSection);
    this.renderBacklinks(infoSection);
  }

  renderDetails(container) {
    const section = container.createDiv({ cls: "image-manager-detail-section" });
    section.createEl("h4", { text: "详细信息" });
    const list = section.createDiv({ cls: "image-manager-detail-list" });
    this.createDetailItem(list, "路径", this.file.path);
    this.createDetailItem(list, "大小", formatBytes(this.file.stat.size));
    this.createDetailItem(list, "创建时间", new Date(this.file.stat.ctime).toLocaleString());
    this.createDetailItem(list, "修改时间", new Date(this.file.stat.mtime).toLocaleString());
  }

  createDetailItem(container, label, value) {
    const item = container.createDiv({ cls: "image-manager-detail-item" });
    item.createSpan({ cls: "image-manager-detail-label", text: label });
    item.createSpan({ cls: "image-manager-detail-value", text: value });
  }

  renderBacklinks(container) {
    const section = container.createDiv({ cls: "image-manager-backlinks-section" });
    section.createEl("h4", { text: "引用" });
    if (this.references.length === 0) {
      const empty = section.createDiv({ cls: "image-manager-no-backlinks" });
      empty.createDiv({ text: "没有找到引用。" });
      empty.createDiv({ cls: "image-manager-backlink-hint", text: "复制嵌入链接后粘贴到笔记中即可建立引用。" });
      return;
    }

    const list = section.createDiv({ cls: "image-manager-backlinks-list" });
    this.references.forEach(ref => {
      const item = list.createDiv({ cls: "image-manager-backlink-item" });
      item.createDiv({ cls: "image-manager-backlink-name", text: ref.file.name });
      item.createDiv({ cls: "image-manager-backlink-path", text: ref.file.path });
      item.addEventListener("click", async () => {
        const leaf = this.app.workspace.getLeaf(false);
        await leaf.openFile(ref.file);
        const view = leaf.view;
        if (view instanceof MarkdownView && ref.position) {
          view.editor.setCursor(ref.position.start.line, ref.position.start.col);
          view.editor.scrollIntoView({ from: ref.position.start, to: ref.position.end }, true);
        }
        this.close();
      });
    });
  }
}

class ImageFlowSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Image Flow" });

    new Setting(containerEl)
      .setName("启用拖拽移动图片")
      .setDesc("拖动图片到编辑器光标位置时，移动对应的 Markdown 图片链接。")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableImageDragMove ?? this.plugin.settings.enableCanvasPositioning ?? true)
        .onChange(async value => {
          this.plugin.settings.enableImageDragMove = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("启用自动导入")
      .setDesc("粘贴或拖入图片时，先自动处理图片，再插入链接。")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableAutoImport)
        .onChange(async value => {
          this.plugin.settings.enableAutoImport = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("输出格式")
      .setDesc("粘贴和拖入图片时使用的保存格式。")
      .addDropdown(dropdown => dropdown
        .addOption("webp", "WebP")
        .addOption("jpeg", "JPEG")
        .addOption("png", "PNG")
        .addOption("keep-original", "保留原格式")
        .setValue(this.plugin.settings.outputFormat)
        .onChange(async value => {
          this.plugin.settings.outputFormat = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("压缩质量")
      .setDesc(`当前：${Math.round(this.plugin.settings.quality * 100)}%`)
      .addSlider(slider => slider
        .setLimits(10, 100, 1)
        .setValue(Math.round(this.plugin.settings.quality * 100))
        .setDynamicTooltip()
        .onChange(async value => {
          this.plugin.settings.quality = value / 100;
          await this.plugin.saveSettings();
          this.display();
        }));

    new Setting(containerEl)
      .setName("启用重命名模板")
      .setDesc("关闭时使用图片原来的名称；打开后按下方模板命名。")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableRenameTemplate)
        .onChange(async value => {
          this.plugin.settings.enableRenameTemplate = value;
          await this.plugin.saveSettings();
          this.display();
        }));

    if (this.plugin.settings.enableRenameTemplate) {
      new Setting(containerEl)
        .setName("重命名模板")
        .setDesc("可用变量：{noteName}、{originalName}、{date}、{time}、{timestamp}、{index}、{ext}。")
        .addText(text => text
          .setPlaceholder(DEFAULT_SETTINGS.renameTemplate)
          .setValue(this.plugin.settings.renameTemplate)
          .onChange(async value => {
            this.plugin.settings.renameTemplate = value.trim() || DEFAULT_SETTINGS.renameTemplate;
            await this.plugin.saveSettings();
          }));
    }

    new Setting(containerEl)
      .setName("附件保存位置")
      .setDesc("选择导入图片保存到哪里。")
      .addDropdown(dropdown => dropdown
        .addOption("obsidian-default", "Obsidian 默认设置")
        .addOption("current-note-folder", "当前笔记所在文件夹")
        .addOption("custom", "自定义文件夹")
        .setValue(this.plugin.settings.assetFolderMode)
        .onChange(async value => {
          this.plugin.settings.assetFolderMode = value;
          await this.plugin.saveSettings();
          this.display();
        }));

    if (this.plugin.settings.assetFolderMode === "custom") {
      new Setting(containerEl)
        .setName("自定义附件文件夹")
        .addText(text => text
          .setPlaceholder("Assets")
          .setValue(this.plugin.settings.customAssetFolder)
          .onChange(async value => {
            this.plugin.settings.customAssetFolder = value;
            await this.plugin.saveSettings();
          }));
    }

    containerEl.createEl("h3", { text: "图片管理器" });

    new Setting(containerEl)
      .setName("显示文件大小")
      .setDesc("在图片卡片上显示文件大小信息。")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.imageManagerShowFileSize)
        .onChange(async value => {
          this.plugin.settings.imageManagerShowFileSize = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("显示修改时间")
      .setDesc("在图片卡片上显示最后修改时间。")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.imageManagerShowModifiedTime)
        .onChange(async value => {
          this.plugin.settings.imageManagerShowModifiedTime = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("默认排序字段")
      .setDesc("打开图片管理器时的默认排序方式。")
      .addDropdown(dropdown => dropdown
        .addOption("mtime", "修改时间")
        .addOption("name", "名称")
        .addOption("size", "文件大小")
        .setValue(this.plugin.settings.imageManagerDefaultSortField)
        .onChange(async value => {
          this.plugin.settings.imageManagerDefaultSortField = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("默认排序顺序")
      .setDesc("打开图片管理器时的默认排序顺序。")
      .addDropdown(dropdown => dropdown
        .addOption("desc", "降序")
        .addOption("asc", "升序")
        .setValue(this.plugin.settings.imageManagerDefaultSortOrder)
        .onChange(async value => {
          this.plugin.settings.imageManagerDefaultSortOrder = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("排除文件夹路径")
      .setDesc("在图片管理器中排除这些文件夹，每行一个路径。")
      .addTextArea(text => {
        text
          .setPlaceholder("输入要排除的文件夹路径，每行一个。")
          .setValue(this.plugin.settings.imageManagerExcludedFolderPaths)
          .onChange(async value => {
            this.plugin.settings.imageManagerExcludedFolderPaths = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.rows = 5;
      });

    new Setting(containerEl)
      .setName("复制链接规则")
      .setDesc("从图库复制图片链接时使用的格式。")
      .addDropdown(dropdown => dropdown
        .addOption("short-if-unique", "无重名时使用短名称")
        .addOption("always-short", "始终使用短名称")
        .addOption("always-path", "始终使用完整路径")
        .setValue(this.plugin.settings.copyLinkPolicy)
        .onChange(async value => {
          this.plugin.settings.copyLinkPolicy = value;
          await this.plugin.saveSettings();
        }));
  }
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

module.exports = ImageFlowPlugin;
