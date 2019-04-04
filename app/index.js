// Load application styles
import 'styles/index.less';

// Load tree data
import TREE_DATA from './data';

// ================================
// START YOUR APP HERE
// ================================

const dataController = (function() {
    const data = [TREE_DATA];

    return {
        saveNewFolder : function(folderPath, folderData) {
            const idx = folderPath.shift();
            
            if(folderPath.length === 0) {
                if(!folderData[idx].children) {
                    folderData[idx].children = [{name: "new stuff"}];
                    return folderData[idx].children;
                }
            } else {
                return dataController.saveNewFolder(folderPath, folderData[idx].children);
            }
        },

        addSingleFile : function(path) {
            let dataChildren = dataController.searchData(path, data).children;

            dataChildren[dataChildren.length] = {name : "new stuff"};

            return dataChildren;
        },

        searchData : function(folderPath, folderData) {
            const idx = folderPath.shift();

            if(folderPath.length === 0) {
                return folderData[idx];
            } else {
                return dataController.searchData(folderPath, folderData[idx].children);
            }
        },

        getData : function() {
            return data;
        },
    }
})();


const uiController = (function() {
    const DOMStrings = {
        content : '.content',
        plusBtn : '.btn-plus',
    };

    function getIconString() {
        return `
            <div class="icon-plus">
                <svg>
                    <use href="assets/sprite.svg#icon-plus"></use>
                </svg>
            </div>`;
    };

    function makeNewList(childrenData) {
        const newList = document.createElement('ul');

        for(let i = 0; i <= childrenData.length; i++) {
            let outerList = document.createElement('li');
            let innerList = document.createElement('li');

            if(i === childrenData.length) {
                innerList.innerHTML = getIconString();
                innerList.setAttribute('class', 'btn-plus');
            } else {
                if(childrenData[i].children) {
                    innerList.classList.add('folder');
                } else {
                    innerList.classList.add('file');
                }
                innerList.textContent = childrenData[i].name;
                innerList.setAttribute('data-idx', i);
            }

            outerList.appendChild(innerList);
            newList.appendChild(outerList);
        }

        return newList;
    };

    return {
        displayChildren : function(folderElement, childrenData) {
            let lists = makeNewList(childrenData);

            if(folderElement.classList.contains('file')) {
                folderElement.classList.remove('file');
            }
            
            if(folderElement.className !== 'root-folder') {
                folderElement.classList.add('folder');
            }

            folderElement.parentElement.appendChild(lists);
        },

        addSingleList : function(elementBtnPlus, childrenData) {
            let outerList = document.createElement('li');
            let innerList = document.createElement('li');

            innerList.textContent = 'new stuff';
            innerList.classList.add('file');
            innerList.setAttribute('data-idx', childrenData.length - 1);
            outerList.appendChild(innerList);
            elementBtnPlus.parentElement.insertAdjacentElement('beforebegin', outerList); 
        },

        getFolderPath : function(targetEl) {
            const folderPath = [];
            
            if(targetEl.className !== 'btn-plus') {
                folderPath.push(parseInt(targetEl.dataset.idx));
            }
            
            while(targetEl.parentNode.className !== 'root') {
                const parentFolder = targetEl.parentElement.parentElement.parentElement.children[0];

                if(parentFolder) {
                    targetEl = parentFolder;
                }

                folderPath.unshift(parseInt(targetEl.dataset.idx));
            }

            return folderPath;
        },

        getDOMStrings : function() {
            return DOMStrings;
        },
    }
})();


const appController = (function(dataCtrl, uiCtrl) {
    const DOM = uiCtrl.getDOMStrings();

    function setupEventListeners() {
        document.querySelector(DOM.content).addEventListener('click', function(ev) {
            const targetEl = ev.target;
            
            if(targetEl.tagName === 'LI') {
                const isFolder = targetEl.parentElement.children.length === 2;

                if(isFolder) {
                    targetEl.parentElement.children[1].classList.toggle('hide');
                }
        
                if(!targetEl.classList.contains('btn-plus')) {
                    ctrlChildren(targetEl);
                }
            }
            
            const btn = targetEl.closest(DOM.plusBtn);
            
            if(btn) {
                makeSingleList(btn);
            }
        });
    
        document.querySelector(DOM.content).addEventListener('dblclick', ctrlNewFolder);
    };

    function ctrlChildren(targetElement) {
        const folderPath = uiCtrl.getFolderPath(targetElement);
        const targetData = dataCtrl.searchData(folderPath, dataCtrl.getData());
        const folded = targetElement.parentElement.children.length < 2 && targetData.children;
        
        if(folded) {
            uiCtrl.displayChildren(targetElement, targetData.children);
        }
    };

    function ctrlNewFolder(ev) {
        const targetEl = ev.target;
        const folderPath = uiCtrl.getFolderPath(targetEl);
        const newChildren = dataCtrl.saveNewFolder(folderPath, dataCtrl.getData());
        const isFile = targetEl.parentElement.children.length === 1;
        
        if(isFile) {
            uiCtrl.displayChildren(targetEl, newChildren);
        }
    };

    function makeSingleList(btnEl) {
        const folderPath = uiCtrl.getFolderPath(btnEl);
        const dataChildren = dataController.addSingleFile(folderPath);

        uiCtrl.addSingleList(btnEl, dataChildren);
    };

    return {
        init: function() {
            const folders = document.createElement('ul');
            const rootFolder = document.createElement('li');
            const rootInnerFolder = document.createElement('li');

            folders.setAttribute('class', 'rootUL');
            rootInnerFolder.textContent = TREE_DATA.name;
            rootInnerFolder.setAttribute('data-idx', 0);
            rootInnerFolder.setAttribute('class', 'root-folder');
            rootFolder.appendChild(rootInnerFolder);
            rootFolder.setAttribute('class', 'root');
            folders.appendChild(rootFolder);

            document.querySelector(DOM.content).appendChild(folders);

            setupEventListeners();
        },
    };
})(dataController, uiController);

appController.init();

/* DO NOT REMOVE */
module.hot.accept();
/* DO NOT REMOVE */
