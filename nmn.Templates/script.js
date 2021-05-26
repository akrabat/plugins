var exports = (function (exports) {
  'use strict';

  async function chooseOption(title, options, defaultValue) {
    const {
      index
    } = await CommandBar.showOptions(options.map(option => option.label), title);
    return options[index]?.value ?? defaultValue;
  }
  async function showMessage(title, okLabel = 'OK') {
    await CommandBar.showOptions([okLabel], title);
  }
  async function getInput(title, okLabel = 'OK') {
    return await CommandBar.showInput(title, okLabel);
  }

  async function addTemplate() {
    const templateFolder = DataStore.folders.find(folder => folder.includes('Templates')); // If Template folder doesn't exist, make one and exit

    if (templateFolder == null) {
      DataStore.newNote(`Dummy Template\nCreated on {{date({locale: 'en_IN', dateStyle: 'short'})}}`, 'Templates');
      await showMessage('Created a dummy template to get you started');
      return;
    } // A note must already be open for this plugin


    if (Editor.note == null) {
      await showMessage('Please open a note where this content can be added and try again.');
      return;
    }

    const options = DataStore.projectNotes.filter(n => n.filename?.startsWith(templateFolder)).map(note => note.title == null ? null : {
      label: note.title,
      value: note
    }).filter(Boolean);
    const selectedTemplate = await chooseOption('Choose Template', options);
    const templateContent = selectedTemplate?.content;

    if (templateContent == null) {
      return;
    }

    const processedTemplateContent = await processTemplate(templateContent);
    Editor.content = [Editor.content, processedTemplateContent].filter(Boolean).join('\n');
  }

  async function processTemplate(content) {
    const tagStart = content.indexOf('{{');
    const tagEnd = content.indexOf('}}');
    const hasTag = tagStart !== -1 && tagEnd !== -1 && tagStart < tagEnd;

    if (!hasTag) {
      return content;
    }

    const beforeTag = content.slice(0, tagStart);
    const afterTag = content.slice(tagEnd + 2);
    const tag = content.slice(tagStart + 2, tagEnd);
    const tagProcessed = await processTag(tag);
    const restProcessed = await processTemplate(afterTag);
    return beforeTag + tagProcessed + restProcessed;
  }

  async function processTag(tag) {
    if (tag.startsWith('date(') && tag.endsWith(')')) {
      return processDate(tag.slice(5, tag.length - 1));
    }

    return await getInput(`Value for ${tag}`);
  }

  function processDate(_dateConfig) {
    // TODO:
    // json5.parse(dateConfig)
    return new Intl.DateTimeFormat([], {
      dateStyle: 'short'
    }).format(new Date());
  }

  function newNoteWithTemplate() {
    console.log('newNoteWithTemplate run');
  }

  exports.addTemplate = addTemplate;
  exports.newNoteWithTemplate = newNoteWithTemplate;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

}({}));
Object.assign(globalThis, exports)
