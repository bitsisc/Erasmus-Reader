/**
 * ALGORITHMS.JS - Syllabification engine & language-specific rules
 */

/* ==========================================================================
   1. GREEK SYLLABIFICATION ALGORITHM (COMPLETE)
   ========================================================================== */
function syllabifyGreekWord(word) {
    if (word.length <= 1) return word;

    // Vocalic letters identification
    const isV = c => /[αεηιουωάέήίόύώϊϋΐΰ]/i.test(c);

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0]);

    // Step 1: Group into vowel and consonant blocks
    for (let char of word) {
        if (isV(char) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    // Step 2: Diphthongs and Synizesis recognition
    let refinedChunks = [];
    for (let chunk of chunks) {
        if (chunk.type === 'C') {
            refinedChunks.push(chunk);
        } else {
            let vStr = chunk.val;
            let i = 0;
            while (i < vStr.length) {
                let maxMatchLen = 1;
                
                // Triple vowel combinations
                if (i + 2 < vStr.length) {
                    let t = (vStr[i]+vStr[i+1]+vStr[i+2]).toLowerCase();
                    if (['οια','οιε','οιο','οιω', 'εια','ειε','ειο','ειω', 'ιου', 'ιού'].includes(t)) {
                        maxMatchLen = 3;
                    }
                }
                
                // Double vowel combinations (diphthongs & synizesis)
                if (maxMatchLen === 1 && i + 1 < vStr.length) {
                    let p = (vStr[i]+vStr[i+1]).toLowerCase();
                    let diphthongs = ['αι','ει','οι','υι','αυ','ευ','ου','αί','εί','οί','υί','αύ','εύ','ού','άι','όι','έι'];
                    let synizesis = ['ια','ιε','ιο','ιω','υα','υε','υο','υω','ιά','ιέ','ιό','ιώ','υά','υέ','υό','υώ'];
                    
                    if (diphthongs.includes(p)) {
                        maxMatchLen = 2;
                    } else if (synizesis.includes(p) && !/[άέήίόύώΐΰ]/.test(vStr[i])) {
                        // Prevent synizesis if next letter starts a strong diphthong (e.g. Ι-ού-λι-ος)
                        let isSyn = true;
                        if (i + 2 < vStr.length) {
                            let nextPair = (vStr[i+1]+vStr[i+2]).toLowerCase();
                            if (diphthongs.includes(nextPair)) isSyn = false;
                        }
                        if (isSyn) maxMatchLen = 2;
                    }
                }
                refinedChunks.push({ type: 'V', val: vStr.substr(i, maxMatchLen) });
                i += maxMatchLen;
            }
        }
    }

    // Step 3: Syllabify using grammatical rules
    const startsWord = cluster => {
        const valid = ['βγ','βδ','βλ','βρ','γλ','γν','γρ','δρ','θλ','θν','θρ','κλ','κν','κρ','κτ','μν','μπ','ντ','πλ','πν','πρ','πτ','σβ','σγ','σδ','σθ','σκ','σλ','σμ','σν','σπ','στ','σφ','σχ','τκ','τλ','τμ','τρ','τσ','τζ','φθ','φλ','φρ','χλ','χν','χρ', 'γγ', 'γκ'];
        return valid.includes(cluster.toLowerCase());
    };

    let result = "";
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        
        if (chunk.type === 'V') {
            result += chunk.val;
            // Separate consecutive vowels that are not unified (e.g. α-ε-τός)
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; } 
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                if (cStr.length === 1) {
                    result += "|" + cStr; // Single consonant goes to the next syllable
                } else {
                    let firstTwo = cStr.substring(0, 2);
                    if (startsWord(firstTwo)) {
                        result += "|" + cStr; // The cluster can start a Greek word -> goes to next syllable
                    } else {
                        result += cStr.substring(0, 1) + "|" + cStr.substring(1); // Splits after first consonant
                    }
                }
            } else {
                result += cStr; // Start or end of word
            }
        }
    }

    return result;
}

/* ==========================================================================
   2. FALLBACK/GENERIC SYLLABIFICATION ALGORITHM
   ========================================================================== */
function syllabifyGenericWord(word) {
    if (word.length <= 2) return word;

    const vowels = 'aeiouyáéíóúàèìòùäëïöüâêîôûãõåæøœăîâșțąęśćżźńłñeuoaiуеыаоэяиюё';
    const isVowel = c => vowels.includes(c.toLowerCase());
    
    let result = "";
    let i = 0;

    while (i < word.length) {
        result += word[i];
        let c1 = word[i];
        let c2 = i + 1 < word.length ? word[i + 1] : '';
        let c3 = i + 2 < word.length ? word[i + 2] : '';
        let c4 = i + 3 < word.length ? word[i + 3] : '';

        if (isVowel(c1)) {
            if (c2 !== '' && !isVowel(c2) && isVowel(c3)) {
                result += '|'; // V-CV rule
            } else if (c2 !== '' && !isVowel(c2) && c3 !== '' && !isVowel(c3) && isVowel(c4)) {
                result += c2 + '|'; // VC-CV rule
                i++;
            }
        }
        i++;
    }
    return result.replace(/\|$/, '');
}

/* ==========================================================================
   3. LANGUAGE-SPECIFIC PLACEHOLDERS (WILL BE DEVELOPED IN PHASES)
   ========================================================================== */
function syllabifyENWord(word) {
    if (word.length <= 2) return word;

    const vowels = 'aeiouyAEOUY';
    const isV = c => vowels.includes(c);

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0]);

    for (let char of word) {
        if (isV(char) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    let refinedChunks = [];
    for (let chunk of chunks) {
        if (chunk.type === 'C') {
            refinedChunks.push(chunk);
        } else {
            let vStr = chunk.val;
            let i = 0;
            const diphthongs = ['ee', 'oo', 'ea', 'oa', 'ai', 'ay', 'ou', 'ow', 'oi', 'oy', 'au', 'aw', 'ei', 'ey', 'ie'];
            while (i < vStr.length) {
                let matched = false;
                if (i + 1 < vStr.length) {
                    let digraph = vStr.substr(i, 2).toLowerCase();
                    if (diphthongs.includes(digraph)) {
                        refinedChunks.push({ type: 'V', val: vStr.substr(i, 2) });
                        i += 2;
                        matched = true;
                    }
                }
                if (!matched) {
                    refinedChunks.push({ type: 'V', val: vStr[i] });
                    i++;
                }
            }
        }
    }

    if (refinedChunks.length >= 3) {
        let lastChunk = refinedChunks[refinedChunks.length - 1];
        let secondLast = refinedChunks[refinedChunks.length - 2];
        if (lastChunk.type === 'V' && lastChunk.val.toLowerCase() === 'e' && secondLast.type === 'C') {
            let vowelCount = refinedChunks.filter(c => c.type === 'V').length;
            if (vowelCount > 1) {
                refinedChunks.pop();
                secondLast.val += lastChunk.val;
            }
        }
    }

    const startsSyllable = cluster => {
        const lower = cluster.toLowerCase();
        if (['sh', 'ch', 'th', 'ph', 'wh', 'ng', 'gh'].includes(lower)) return true;
        if (lower.length === 2) {
            const c1 = lower[0];
            const c2 = lower[1];
            if ('bcdfgptv'.includes(c1) && 'lr'.includes(c2)) return true;
        }
        return false;
    };

    let result = "";
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                let isDouble = cStr.length === 2 && cStr[0].toLowerCase() === cStr[1].toLowerCase();
                
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (isDouble) {
                        result += cStr[0] + "|" + cStr[1];
                    } else if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else if (cStr.length === 3) {
                    if (startsSyllable(cStr.substring(1, 3))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else {
                        result += cStr.substring(0, 2) + "|" + cStr[2];
                    }
                } else {
                    result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // English
function syllabifyDEWord(word) {
    if (word.length <= 2) return word;

    const vowels = 'aeiouäöüyAEOUÄÖÜY';
    const isV = c => vowels.includes(c);

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0]);

    for (let char of word) {
        if (isV(char) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    let refinedChunks = [];
    for (let chunk of chunks) {
        if (chunk.type === 'C') {
            refinedChunks.push(chunk);
        } else {
            let vStr = chunk.val;
            let i = 0;
            const diphthongs = ['ei', 'ey', 'ai', 'ay', 'au', 'äu', 'eu', 'ie'];
            while (i < vStr.length) {
                let matched = false;
                if (i + 1 < vStr.length) {
                    let digraph = vStr.substr(i, 2).toLowerCase();
                    if (diphthongs.includes(digraph) || digraph === 'äu') {
                        refinedChunks.push({ type: 'V', val: vStr.substr(i, 2) });
                        i += 2;
                        matched = true;
                    }
                }
                if (!matched) {
                    refinedChunks.push({ type: 'V', val: vStr[i] });
                    i++;
                }
            }
        }
    }

    const startsSyllable = cluster => {
        const lower = cluster.toLowerCase();
        if (['ch', 'sch', 'ph', 'ck', 'th'].includes(lower)) return true;
        return false;
    };

    let result = "";
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else if (cStr.length === 3) {
                    if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else if (startsSyllable(cStr.substring(1, 3))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else {
                        result += cStr.substring(0, 2) + "|" + cStr[2];
                    }
                } else {
                    if (startsSyllable(cStr.substring(1))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else if (startsSyllable(cStr.substring(2))) {
                        result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                    } else {
                        result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                    }
                }
            } else {
                result += cStr;
            }
        }
    }

    const lowerWord = word.toLowerCase();
    const prefixes = ['ge|', 'be|', 'ent|', 'ver|', 'zer|', 'er|'];
    for (let pref of prefixes) {
        let cleanPref = pref.replace('|', '');
        if (lowerWord.startsWith(cleanPref)) {
            let prefLen = cleanPref.length;
            result = result.substring(0, prefLen) + '|' + result.substring(prefLen);
            result = result.replace(/\|\|/g, '|');
            break;
        }
    }

    return result;
} // German
function syllabifyNLWord(word) {
    if (word.length <= 2) return word;

    const vowels = 'aeiouyäëïöüAEOUYÄËÏÖÜ';
    const isV = c => vowels.includes(c);

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0]);

    for (let char of word) {
        if (isV(char) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    let refinedChunks = [];
    for (let chunk of chunks) {
        if (chunk.type === 'C') {
            refinedChunks.push(chunk);
        } else {
            let vStr = chunk.val;
            let i = 0;
            const diphthongs = ['aa', 'ee', 'oo', 'uu', 'au', 'ou', 'ei', 'ij', 'ui', 'oe', 'ie', 'eu', 'ai', 'oi'];
            while (i < vStr.length) {
                let matched = false;
                if (i + 1 < vStr.length) {
                    let digraph = vStr.substr(i, 2).toLowerCase();
                    if (diphthongs.includes(digraph)) {
                        refinedChunks.push({ type: 'V', val: vStr.substr(i, 2) });
                        i += 2;
                        matched = true;
                    }
                }
                if (!matched) {
                    refinedChunks.push({ type: 'V', val: vStr[i] });
                    i++;
                }
            }
        }
    }

    const startsSyllable = cluster => {
        const lower = cluster.toLowerCase();
        if (lower === 'ch') return true;
        if (lower.length === 2) {
            const c1 = lower[0];
            const c2 = lower[1];
            if ('bcdfgptv'.includes(c1) && 'lr'.includes(c2)) return true;
        }
        return false;
    };

    let result = "";
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                let isDouble = cStr.length === 2 && cStr[0].toLowerCase() === cStr[1].toLowerCase();
                
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (isDouble) {
                        result += cStr[0] + "|" + cStr[1];
                    } else if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else if (cStr.length === 3) {
                    if (startsSyllable(cStr.substring(1, 3))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else {
                        result += cStr.substring(0, 2) + "|" + cStr[2];
                    }
                } else {
                    result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // Dutch
function syllabifyFRWord(word) {
    if (word.length <= 1) return word;

    const vowels = 'aeiouyàâéèêëîïôûüÿœæAEOUYÀÂÉÈÊËÎÏÔÛÜŸŒÆ';
    const isV = c => vowels.includes(c);

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0]);

    for (let char of word) {
        if (isV(char) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    let refinedChunks = [];
    for (let chunk of chunks) {
        if (chunk.type === 'C') {
            refinedChunks.push(chunk);
        } else {
            let vStr = chunk.val;
            let i = 0;
            const digraphs = ['ou', 'oi', 'ui', 'au', 'eu', 'ai', 'ei', 'eau', 'oeu', 'oei'];
            while (i < vStr.length) {
                let matched = false;
                // Try to match trigraphs (like eau, oeu)
                if (i + 2 < vStr.length) {
                    let trigraph = vStr.substr(i, 3).toLowerCase();
                    if (digraphs.includes(trigraph) || trigraph === 'eau' || trigraph === 'oeu' || trigraph === 'oei') {
                        refinedChunks.push({ type: 'V', val: vStr.substr(i, 3) });
                        i += 3;
                        matched = true;
                    }
                }
                // Try to match digraphs
                if (!matched && i + 1 < vStr.length) {
                    let digraph = vStr.substr(i, 2).toLowerCase();
                    if (digraphs.includes(digraph)) {
                        refinedChunks.push({ type: 'V', val: vStr.substr(i, 2) });
                        i += 2;
                        matched = true;
                    }
                }
                if (!matched) {
                    refinedChunks.push({ type: 'V', val: vStr[i] });
                    i++;
                }
            }
        }
    }

    const startsSyllable = cluster => {
        const lower = cluster.toLowerCase();
        if (['ch', 'ph', 'th', 'gn'].includes(lower)) return true;
        if (lower.length === 2) {
            const c1 = lower[0];
            const c2 = lower[1];
            if ('bcdfgptv'.includes(c1) && 'lr'.includes(c2)) return true;
        }
        return false;
    };

    let result = "";
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else if (cStr.length === 3) {
                    if (startsSyllable(cStr.substring(1, 3))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else {
                        result += cStr.substring(0, 2) + "|" + cStr[2];
                    }
                } else {
                    result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // French
function syllabifyESWord(word) {
    if (word.length <= 1) return word;
    
    const vowels = 'aeiouáéíóúüyAEOUÁÉÍÓÚÜY';
    
    const isV = (c, idx) => {
        if (!vowels.includes(c)) return false;
        if (c.toLowerCase() === 'y') {
            if (idx === word.length - 1) return true;
            return !vowels.includes(word[idx + 1]);
        }
        return true;
    };

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0], 0);

    for (let i = 0; i < word.length; i++) {
        let char = word[i];
        if (isV(char, i) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char, i);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    let refinedChunks = [];
    for (let chunk of chunks) {
        if (chunk.type === 'C') {
            refinedChunks.push(chunk);
        } else {
            let vStr = chunk.val;
            const strong = 'aeoáéíóúAEOÁÉÍÓÚ';
            let i = 0;
            while (i < vStr.length) {
                let current = vStr[i];
                while (i + 1 < vStr.length) {
                    let prev = vStr[i];
                    let curr = vStr[i + 1];
                    let prevIsStrong = strong.includes(prev);
                    let currIsStrong = strong.includes(curr);
                    
                    if (prevIsStrong && currIsStrong) {
                        break;
                    } else {
                        current += curr;
                        i++;
                    }
                }
                refinedChunks.push({ type: 'V', val: current });
                i++;
            }
        }
    }

    const startsSyllable = cluster => {
        const lower = cluster.toLowerCase();
        if (lower === 'ch' || lower === 'll' || lower === 'rr') return true;
        if (lower.length === 2) {
            const c1 = lower[0];
            const c2 = lower[1];
            if ('bcdfgkptv'.includes(c1) && 'lr'.includes(c2)) return true;
        }
        return false;
    };

    let result = "";
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else if (cStr.length === 3) {
                    if (startsSyllable(cStr.substring(1, 3))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else {
                        result += cStr.substring(0, 2) + "|" + cStr[2];
                    }
                } else {
                    result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // Spanish
function syllabifyITWord(word) {
    if (word.length <= 1) return word;

    const vowels = 'aeiouàèéìòóùAEOUÀÈÉÌÒÓÙ';
    const isV = c => vowels.includes(c);

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0]);

    for (let char of word) {
        if (isV(char) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    let refinedChunks = [];
    for (let chunk of chunks) {
        if (chunk.type === 'C') {
            refinedChunks.push(chunk);
        } else {
            let vStr = chunk.val;
            const strong = 'aeoàèéòóAEOÀÈÉÒÓìùÌÙ';
            let i = 0;
            while (i < vStr.length) {
                let current = vStr[i];
                while (i + 1 < vStr.length) {
                    let prev = vStr[i];
                    let curr = vStr[i+1];
                    let prevIsStrong = strong.includes(prev);
                    let currIsStrong = strong.includes(curr);
                    if (prevIsStrong && currIsStrong) {
                        break;
                    } else {
                        current += curr;
                        i++;
                    }
                }
                refinedChunks.push({ type: 'V', val: current });
                i++;
            }
        }
    }

    const startsSyllable = cluster => {
        const lower = cluster.toLowerCase();
        if (['ch', 'gh', 'gl', 'gn', 'sc'].includes(lower)) return true;
        if (lower.startsWith('s') && lower.length >= 2 && lower[1] !== 's') return true;
        if (lower.length === 2) {
            const c1 = lower[0];
            const c2 = lower[1];
            if ('bcdfgptv'.includes(c1) && 'lr'.includes(c2)) return true;
        }
        return false;
    };

    let result = "";
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                let isDouble = cStr.length === 2 && cStr[0].toLowerCase() === cStr[1].toLowerCase();
                
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (isDouble) {
                        result += cStr[0] + "|" + cStr[1];
                    } else if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else if (cStr.length === 3) {
                    if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else if (startsSyllable(cStr.substring(1, 3))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else {
                        result += cStr.substring(0, 2) + "|" + cStr[2];
                    }
                } else if (cStr.length === 4) {
                    if (startsSyllable(cStr.substring(1))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else {
                        result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                    }
                } else {
                    result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // Italian
function syllabifyPTWord(word) {
    if (word.length <= 1) return word;

    const vowels = 'aeiouáéíóúâêôãõàüAEOUÁÉÍÓÚÂÊÔÃÕÀÜ';
    const isV = c => vowels.includes(c);

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0]);

    for (let char of word) {
        if (isV(char) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    let refinedChunks = [];
    for (let chunk of chunks) {
        if (chunk.type === 'C') {
            refinedChunks.push(chunk);
        } else {
            let vStr = chunk.val;
            const strong = 'aeoáéíóúâêôãõàAEOUÁÉÍÓÚÂÊÔÃÕÀ';
            let i = 0;
            while (i < vStr.length) {
                let current = vStr[i];
                while (i + 1 < vStr.length) {
                    let prev = vStr[i];
                    let curr = vStr[i+1];
                    let prevIsStrong = strong.includes(prev);
                    let currIsStrong = strong.includes(curr);
                    if (prevIsStrong && currIsStrong) {
                        break;
                    } else {
                        current += curr;
                        i++;
                    }
                }
                refinedChunks.push({ type: 'V', val: current });
                i++;
            }
        }
    }

    const startsSyllable = cluster => {
        const lower = cluster.toLowerCase();
        if (['ch', 'lh', 'nh', 'gu', 'qu'].includes(lower)) return true;
        if (lower.length === 2) {
            const c1 = lower[0];
            const c2 = lower[1];
            if ('bcdfgptv'.includes(c1) && 'lr'.includes(c2)) return true;
        }
        return false;
    };

    const alwaysSplit = cluster => {
        const lower = cluster.toLowerCase();
        return ['rr', 'ss', 'sc', 'sç', 'xc', 'xs'].includes(lower);
    };

    let result = "";
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (alwaysSplit(cStr)) {
                        result += cStr[0] + "|" + cStr[1];
                    } else if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else if (cStr.length === 3) {
                    if (alwaysSplit(cStr.substring(0, 2))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else if (startsSyllable(cStr.substring(1, 3))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else {
                        result += cStr.substring(0, 2) + "|" + cStr[2];
                    }
                } else {
                    result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // Portuguese
function syllabifyPTWord_placeholder(word) { return syllabifyGenericWord(word); } // Unused placeholder
function syllabifyPLWord(word) {
    if (word.length <= 2) return word;

    const vowels = 'aeiouyąęóAEOUYĄĘÓ';
    const isV = (c, idx) => {
        if (!vowels.includes(c)) return false;
        if (c.toLowerCase() === 'i' && idx + 1 < word.length && vowels.includes(word[idx + 1])) {
            return false;
        }
        return true;
    };

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0], 0);

    for (let i = 0; i < word.length; i++) {
        let char = word[i];
        if (isV(char, i) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char, i);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    const startsSyllable = cluster => {
        const lower = cluster.toLowerCase();
        if (['ch', 'cz', 'dz', 'dż', 'dź', 'sz', 'rz'].includes(lower)) return true;
        if (lower.length === 2) {
            const c1 = lower[0];
            const c2 = lower[1];
            if ('bcdfgptwz'.includes(c1) && 'lrłw'.includes(c2)) return true;
        }
        return false;
    };

    let result = "";
    let refinedChunks = chunks;
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                let isDouble = cStr.length === 2 && cStr[0].toLowerCase() === cStr[1].toLowerCase();
                
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (isDouble) {
                        result += cStr[0] + "|" + cStr[1];
                    } else if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else if (cStr.length === 3) {
                    if (startsSyllable(cStr.substring(1, 3))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else {
                        result += cStr.substring(0, 2) + "|" + cStr[2];
                    }
                } else {
                    result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // Polish
function syllabifyROWord(word) {
    if (word.length <= 1) return word;

    const vowels = 'aeiouăâîAEOUĂÂÎ';
    const isV = c => vowels.includes(c);

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0]);

    for (let char of word) {
        if (isV(char) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    let refinedChunks = [];
    for (let chunk of chunks) {
        if (chunk.type === 'C') {
            refinedChunks.push(chunk);
        } else {
            let vStr = chunk.val;
            let i = 0;
            const diphthongs = ['ai', 'au', 'ea', 'ia', 'ie', 'io', 'oa', 'ua', 'uă'];
            while (i < vStr.length) {
                let matched = false;
                if (i + 1 < vStr.length) {
                    let digraph = vStr.substr(i, 2).toLowerCase();
                    if (diphthongs.includes(digraph)) {
                        refinedChunks.push({ type: 'V', val: vStr.substr(i, 2) });
                        i += 2;
                        matched = true;
                    }
                }
                if (!matched) {
                    refinedChunks.push({ type: 'V', val: vStr[i] });
                    i++;
                }
            }
        }
    }

    const startsSyllable = cluster => {
        const lower = cluster.toLowerCase();
        if (['ch', 'gh'].includes(lower)) return true;
        if (lower.length === 2) {
            const c1 = lower[0];
            const c2 = lower[1];
            if ('bcdfgphtv'.includes(c1) && 'lr'.includes(c2)) return true;
        }
        return false;
    };

    const splitsAfterSecond = cluster => {
        const lower = cluster.toLowerCase();
        return ['lpt', 'mpț', 'nct', 'ncș', 'ndv', 'rct', 'rtf'].includes(lower);
    };

    let result = "";
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else if (cStr.length === 3) {
                    if (splitsAfterSecond(cStr)) {
                        result += cStr.substring(0, 2) + "|" + cStr[2];
                    } else if (startsSyllable(cStr.substring(1, 3))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else {
                        result += cStr[0] + "|" + cStr.substring(1);
                    }
                } else {
                    result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // Romanian
function syllabifySVWord(word) {
    if (word.length <= 2) return word;

    const vowels = 'aeiouyåäöAEOUYÅÄÖ';
    const isV = c => vowels.includes(c);

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0]);

    for (let char of word) {
        if (isV(char) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    const startsSyllable = cluster => {
        const lower = cluster.toLowerCase();
        if (['sk', 'sj', 'stj', 'tj', 'ch', 'sh'].includes(lower)) return true;
        if (lower.length === 2) {
            const c1 = lower[0];
            const c2 = lower[1];
            if ('bcdfgptv'.includes(c1) && 'lr'.includes(c2)) return true;
        }
        return false;
    };

    let result = "";
    let refinedChunks = chunks;
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                let isDouble = cStr.length === 2 && cStr[0].toLowerCase() === cStr[1].toLowerCase();
                
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (isDouble) {
                        result += cStr[0] + "|" + cStr[1];
                    } else if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else if (cStr.length === 3) {
                    if (startsSyllable(cStr.substring(1, 3))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else {
                        result += cStr.substring(0, 2) + "|" + cStr[2];
                    }
                } else {
                    result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // Swedish
function syllabifyDAWord(word) {
    if (word.length <= 2) return word;

    const vowels = 'aeiouyæøåAEOUYÆØÅ';
    const isV = c => vowels.includes(c);

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0]);

    for (let char of word) {
        if (isV(char) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    const startsSyllable = cluster => {
        const lower = cluster.toLowerCase();
        if (['sj', 'ch', 'ph'].includes(lower)) return true;
        if (lower.length === 2) {
            const c1 = lower[0];
            const c2 = lower[1];
            if ('bcdfgptv'.includes(c1) && 'lr'.includes(c2)) return true;
        }
        return false;
    };

    let result = "";
    let refinedChunks = chunks;
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                let isDouble = cStr.length === 2 && cStr[0].toLowerCase() === cStr[1].toLowerCase();
                
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (isDouble) {
                        result += cStr[0] + "|" + cStr[1];
                    } else if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else if (cStr.length === 3) {
                    if (startsSyllable(cStr.substring(1, 3))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else {
                        result += cStr.substring(0, 2) + "|" + cStr[2];
                    }
                } else {
                    result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // Danish
function syllabifyFIWord(word) {
    if (word.length <= 2) return word;

    const vowels = 'aeiouyäöAEOUYÄÖ';
    const isV = c => vowels.includes(c);

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0]);

    for (let char of word) {
        if (isV(char) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    let refinedChunks = [];
    for (let chunk of chunks) {
        if (chunk.type === 'C') {
            refinedChunks.push(chunk);
        } else {
            let vStr = chunk.val;
            let i = 0;
            const diphthongs = [
                'ai', 'ei', 'oi', 'ui', 'yi', 'äi', 'öi',
                'au', 'eu', 'iu', 'ou', 'ey', 'iy', 'äy', 'öy',
                'ie', 'uo', 'yö'
            ];
            while (i < vStr.length) {
                let matched = false;
                if (i + 1 < vStr.length) {
                    let digraph = vStr.substr(i, 2).toLowerCase();
                    let isLongVowel = digraph[0] === digraph[1];
                    if (diphthongs.includes(digraph) || isLongVowel) {
                        refinedChunks.push({ type: 'V', val: vStr.substr(i, 2) });
                        i += 2;
                        matched = true;
                    }
                }
                if (!matched) {
                    refinedChunks.push({ type: 'V', val: vStr[i] });
                    i++;
                }
            }
        }
    }

    let result = "";
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                let isDouble = cStr.length === 2 && cStr[0].toLowerCase() === cStr[1].toLowerCase();
                
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (isDouble) {
                        result += cStr[0] + "|" + cStr[1];
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else {
                    result += cStr[0] + "|" + cStr.substring(1);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // Finnish
function syllabifyCSWord(word) {
    if (word.length <= 1) return word;

    const vowels = 'aeiouyáéíóúůýAEOUYÁÉÍÓÚŮÝ';
    const isV = (c, idx) => {
        if (vowels.includes(c)) return true;
        const lower = c.toLowerCase();
        if (lower === 'r' || lower === 'l') {
            let prevIsConsonant = (idx === 0) || !vowels.includes(word[idx - 1]);
            let nextIsConsonant = (idx === word.length - 1) || !vowels.includes(word[idx + 1]);
            return prevIsConsonant && nextIsConsonant;
        }
        return false;
    };

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0], 0);

    for (let i = 0; i < word.length; i++) {
        let char = word[i];
        if (isV(char, i) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char, i);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    const startsSyllable = cluster => {
        const lower = cluster.toLowerCase();
        if (lower === 'ch') return true;
        if (lower.length === 2) {
            const c1 = lower[0];
            const c2 = lower[1];
            if ('bcdfgjklmnprstvz'.includes(c1) && 'lr'.includes(c2)) return true;
        }
        return false;
    };

    let result = "";
    let refinedChunks = chunks;
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                let isDouble = cStr.length === 2 && cStr[0].toLowerCase() === cStr[1].toLowerCase();
                
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (isDouble) {
                        result += cStr[0] + "|" + cStr[1];
                    } else if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else if (cStr.length === 3) {
                    if (startsSyllable(cStr.substring(1, 3))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else {
                        result += cStr.substring(0, 2) + "|" + cStr[2];
                    }
                } else {
                    result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // Czech
function syllabifyHUWord(word) {
    if (word.length <= 1) return word;

    const vowels = 'aeiouáéíóöőúüűAEOUÁÉÍÓÖŐÚÜŰ';
    const isV = c => vowels.includes(c);

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0]);

    for (let char of word) {
        if (isV(char) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    const startsSyllable = cluster => {
        const lower = cluster.toLowerCase();
        return ['cs', 'dz', 'dzs', 'gy', 'ly', 'ny', 'sz', 'ty', 'zs'].includes(lower);
    };

    let result = "";
    let refinedChunks = chunks;
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                let isDouble = cStr.length === 2 && cStr[0].toLowerCase() === cStr[1].toLowerCase();
                
                let isDoubleDigraph = false;
                let ddSplit = "";
                if (cStr.length === 3) {
                    const lowerC = cStr.toLowerCase();
                    const digraphs = ['cs', 'dz', 'gy', 'ly', 'ny', 'sz', 'ty', 'zs'];
                    for (let dig of digraphs) {
                        if (lowerC.startsWith(dig[0]) && lowerC.substring(1) === dig) {
                            isDoubleDigraph = true;
                            ddSplit = cStr.substring(0, 1) + "|" + cStr.substring(1);
                            break;
                        }
                    }
                }

                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (isDoubleDigraph) {
                    result += ddSplit;
                } else if (cStr.length === 2) {
                    if (isDouble) {
                        result += cStr[0] + "|" + cStr[1];
                    } else if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else if (cStr.length === 3) {
                    if (startsSyllable(cStr.substring(1, 3))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else {
                        result += cStr.substring(0, 2) + "|" + cStr[2];
                    }
                } else {
                    result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // Hungarian
function syllabifySKWord(word) {
    if (word.length <= 1) return word;

    const vowels = 'aeiouyáéíóúýäôAEOUYÁÉÍÓÚÝÄÔ';
    const isV = (c, idx) => {
        if (vowels.includes(c)) return true;
        const lower = c.toLowerCase();
        if (lower === 'r' || lower === 'l' || lower === 'ŕ' || lower === 'ĺ') {
            let prevIsConsonant = (idx === 0) || !vowels.includes(word[idx - 1]);
            let nextIsConsonant = (idx === word.length - 1) || !vowels.includes(word[idx + 1]);
            return prevIsConsonant && nextIsConsonant;
        }
        return false;
    };

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0], 0);

    for (let i = 0; i < word.length; i++) {
        let char = word[i];
        if (isV(char, i) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char, i);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    let refinedChunks = [];
    for (let chunk of chunks) {
        if (chunk.type === 'C') {
            refinedChunks.push(chunk);
        } else {
            let vStr = chunk.val;
            let i = 0;
            const diphthongs = ['ia', 'ie', 'iu'];
            while (i < vStr.length) {
                let matched = false;
                if (i + 1 < vStr.length) {
                    let digraph = vStr.substr(i, 2).toLowerCase();
                    if (diphthongs.includes(digraph)) {
                        refinedChunks.push({ type: 'V', val: vStr.substr(i, 2) });
                        i += 2;
                        matched = true;
                    }
                }
                if (!matched) {
                    refinedChunks.push({ type: 'V', val: vStr[i] });
                    i++;
                }
            }
        }
    }

    const startsSyllable = cluster => {
        const lower = cluster.toLowerCase();
        if (['ch', 'dz', 'dž'].includes(lower)) return true;
        if (lower.length === 2) {
            const c1 = lower[0];
            const c2 = lower[1];
            if ('bcdfgjklmnprstvz'.includes(c1) && 'lr'.includes(c2)) return true;
        }
        return false;
    };

    let result = "";
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                let isDouble = cStr.length === 2 && cStr[0].toLowerCase() === cStr[1].toLowerCase();
                
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (isDouble) {
                        result += cStr[0] + "|" + cStr[1];
                    } else if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else if (cStr.length === 3) {
                    if (startsSyllable(cStr.substring(1, 3))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else {
                        result += cStr.substring(0, 2) + "|" + cStr[2];
                    }
                } else {
                    result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // Slovak
function syllabifyBGWord(word) {
    if (word.length <= 1) return word;

    const vowels = 'аеиоуъюяАЕИОУЪЮЯ';
    const isV = c => vowels.includes(c);

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0]);

    for (let char of word) {
        if (isV(char) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    const startsSyllable = cluster => {
        const lower = cluster.toLowerCase();
        if (lower.length === 2) {
            const c1 = lower[0];
            const c2 = lower[1];
            if ('бвгдкптф'.includes(c1) && 'лр'.includes(c2)) return true;
        }
        return false;
    };

    let result = "";
    let refinedChunks = chunks;
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else if (cStr.length === 3) {
                    if (startsSyllable(cStr.substring(1, 3))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else {
                        result += cStr.substring(0, 2) + "|" + cStr[2];
                    }
                } else {
                    result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // Bulgarian
function syllabifyHRWord(word) {
    if (word.length <= 1) return word;

    const vowels = 'aeiouAEOUI';
    const isV = (c, idx) => {
        if (vowels.includes(c)) return true;
        const lower = c.toLowerCase();
        if (lower === 'r') {
            let prevIsConsonant = (idx === 0) || !vowels.includes(word[idx - 1]);
            let nextIsConsonant = (idx === word.length - 1) || !vowels.includes(word[idx + 1]);
            return prevIsConsonant && nextIsConsonant;
        }
        return false;
    };

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0], 0);

    for (let i = 0; i < word.length; i++) {
        let char = word[i];
        if (isV(char, i) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char, i);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    const startsSyllable = cluster => {
        const lower = cluster.toLowerCase();
        if (['dž', 'lj', 'nj'].includes(lower)) return true;
        if (lower.length === 2) {
            const c1 = lower[0];
            const c2 = lower[1];
            if ('bcdfgjklmnprstvz'.includes(c1) && 'lr'.includes(c2)) return true;
        }
        return false;
    };

    let result = "";
    let refinedChunks = chunks;
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                let isDouble = cStr.length === 2 && cStr[0].toLowerCase() === cStr[1].toLowerCase();
                
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (isDouble) {
                        result += cStr[0] + "|" + cStr[1];
                    } else if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else if (cStr.length === 3) {
                    if (startsSyllable(cStr.substring(1, 3))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else {
                        result += cStr.substring(0, 2) + "|" + cStr[2];
                    }
                } else {
                    result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // Croatian
function syllabifyLTWord(word) {
    if (word.length <= 2) return word;

    const vowels = 'aeiouyąęįųūėAEOUYĄĘĮŲŪĖ';
    const isV = c => vowels.includes(c);

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0]);

    for (let char of word) {
        if (isV(char) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    let refinedChunks = [];
    for (let chunk of chunks) {
        if (chunk.type === 'C') {
            refinedChunks.push(chunk);
        } else {
            let vStr = chunk.val;
            let i = 0;
            const diphthongs = ['ai', 'au', 'ei', 'ie', 'ui', 'uo'];
            while (i < vStr.length) {
                let matched = false;
                if (i + 1 < vStr.length) {
                    let digraph = vStr.substr(i, 2).toLowerCase();
                    if (diphthongs.includes(digraph)) {
                        refinedChunks.push({ type: 'V', val: vStr.substr(i, 2) });
                        i += 2;
                        matched = true;
                    }
                }
                if (!matched) {
                    refinedChunks.push({ type: 'V', val: vStr[i] });
                    i++;
                }
            }
        }
    }

    const startsSyllable = cluster => {
        const lower = cluster.toLowerCase();
        if (lower === 'ch') return true;
        if (lower.length === 2) {
            const c1 = lower[0];
            const c2 = lower[1];
            if ('bcdfgptv'.includes(c1) && 'lr'.includes(c2)) return true;
        }
        return false;
    };

    let result = "";
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                let isDouble = cStr.length === 2 && cStr[0].toLowerCase() === cStr[1].toLowerCase();
                
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (isDouble) {
                        result += cStr[0] + "|" + cStr[1];
                    } else if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else if (cStr.length === 3) {
                    if (startsSyllable(cStr.substring(1, 3))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else {
                        result += cStr.substring(0, 2) + "|" + cStr[2];
                    }
                } else {
                    result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // Lithuanian
function syllabifyLVWord(word) {
    if (word.length <= 2) return word;

    const vowels = 'aeiouāēīūAEOUĀĒĪŪ';
    const isV = c => vowels.includes(c);

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0]);

    for (let char of word) {
        if (isV(char) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    let refinedChunks = [];
    for (let chunk of chunks) {
        if (chunk.type === 'C') {
            refinedChunks.push(chunk);
        } else {
            let vStr = chunk.val;
            let i = 0;
            const diphthongs = ['ai', 'au', 'ei', 'ie', 'ui', 'iu', 'o'];
            while (i < vStr.length) {
                let matched = false;
                if (i + 1 < vStr.length) {
                    let digraph = vStr.substr(i, 2).toLowerCase();
                    if (diphthongs.includes(digraph)) {
                        refinedChunks.push({ type: 'V', val: vStr.substr(i, 2) });
                        i += 2;
                        matched = true;
                    }
                }
                if (!matched) {
                    refinedChunks.push({ type: 'V', val: vStr[i] });
                    i++;
                }
            }
        }
    }

    const startsSyllable = cluster => {
        const lower = cluster.toLowerCase();
        if (['dz', 'dž'].includes(lower)) return true;
        if (lower.length === 2) {
            const c1 = lower[0];
            const c2 = lower[1];
            if ('bcdfgptv'.includes(c1) && 'lr'.includes(c2)) return true;
        }
        return false;
    };

    let result = "";
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                let isDouble = cStr.length === 2 && cStr[0].toLowerCase() === cStr[1].toLowerCase();
                
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (isDouble) {
                        result += cStr[0] + "|" + cStr[1];
                    } else if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else if (cStr.length === 3) {
                    if (startsSyllable(cStr.substring(1, 3))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else {
                        result += cStr.substring(0, 2) + "|" + cStr[2];
                    }
                } else {
                    result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // Latvian
function syllabifyETWord(word) {
    if (word.length <= 2) return word;

    const vowels = 'aeiouõäöüAEOUÕÄÖÜ';
    const isV = c => vowels.includes(c);

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0]);

    for (let char of word) {
        if (isV(char) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    let refinedChunks = [];
    for (let chunk of chunks) {
        if (chunk.type === 'C') {
            refinedChunks.push(chunk);
        } else {
            let vStr = chunk.val;
            let i = 0;
            const diphthongs = [
                'ai', 'ei', 'oi', 'ui', 'õi', 'äi', 'öi', 'üi',
                'au', 'eu', 'iu', 'ou', 'õu', 'äu', 'öu',
                'ae', 'ea', 'oa', 'oe', 'öe', 'üe'
            ];
            while (i < vStr.length) {
                let matched = false;
                if (i + 1 < vStr.length) {
                    let digraph = vStr.substr(i, 2).toLowerCase();
                    let isLongVowel = digraph[0] === digraph[1];
                    if (diphthongs.includes(digraph) || isLongVowel) {
                        refinedChunks.push({ type: 'V', val: vStr.substr(i, 2) });
                        i += 2;
                        matched = true;
                    }
                }
                if (!matched) {
                    refinedChunks.push({ type: 'V', val: vStr[i] });
                    i++;
                }
            }
        }
    }

    let result = "";
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                let isDouble = cStr.length === 2 && cStr[0].toLowerCase() === cStr[1].toLowerCase();
                
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (isDouble) {
                        result += cStr[0] + "|" + cStr[1];
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else {
                    result += cStr[0] + "|" + cStr.substring(1);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // Estonian
function syllabifyMTWord(word) {
    if (word.length <= 2) return word;

    const vowels = 'aeiouàâçéèġħgħieżAEOUÀÂÇÉÈĠĦGĦIEŻ';
    const isV = (c, idx) => {
        if (c.toLowerCase() === 'i' && idx + 1 < word.length && word[idx + 1].toLowerCase() === 'e') {
            return true;
        }
        if (c.toLowerCase() === 'e' && idx > 0 && word[idx - 1].toLowerCase() === 'i') {
            return true;
        }
        return vowels.includes(c);
    };

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0], 0);

    for (let i = 0; i < word.length; i++) {
        let char = word[i];
        if (isV(char, i) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char, i);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    let refinedChunks = [];
    for (let chunk of chunks) {
        if (chunk.type === 'C') {
            let cStr = chunk.val;
            let i = 0;
            while (i < cStr.length) {
                if (i + 1 < cStr.length && cStr.substr(i, 2).toLowerCase() === 'għ') {
                    refinedChunks.push({ type: 'C', val: cStr.substr(i, 2) });
                    i += 2;
                } else {
                    refinedChunks.push({ type: 'C', val: cStr[i] });
                    i++;
                }
            }
        } else {
            let vStr = chunk.val;
            let i = 0;
            while (i < vStr.length) {
                if (i + 1 < vStr.length && vStr.substr(i, 2).toLowerCase() === 'ie') {
                    refinedChunks.push({ type: 'V', val: vStr.substr(i, 2) });
                    i += 2;
                } else {
                    refinedChunks.push({ type: 'V', val: vStr[i] });
                    i++;
                }
            }
        }
    }

    let result = "";
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                let isDouble = cStr.length === 2 && cStr[0].toLowerCase() === cStr[1].toLowerCase();
                
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (isDouble) {
                        result += cStr[0] + "|" + cStr[1];
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else {
                    result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // Maltese
function syllabifyGAWord(word) {
    if (word.length <= 2) return word;

    const vowels = 'aeiouáéíóúAEOUÁÉÍÓÚ';
    const isV = c => vowels.includes(c);

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0]);

    for (let char of word) {
        if (isV(char) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    let refinedChunks = [];
    for (let chunk of chunks) {
        if (chunk.type === 'C') {
            let cStr = chunk.val;
            let i = 0;
            while (i < cStr.length) {
                if (i + 1 < cStr.length && cStr[i+1].toLowerCase() === 'h') {
                    refinedChunks.push({ type: 'C', val: cStr.substr(i, 2) });
                    i += 2;
                } else {
                    refinedChunks.push({ type: 'C', val: cStr[i] });
                    i++;
                }
            }
        } else {
            let vStr = chunk.val;
            let i = 0;
            const diphthongs = ['ae', 'ao', 'eo', 'ia', 'ua'];
            while (i < vStr.length) {
                let matched = false;
                if (i + 1 < vStr.length) {
                    let digraph = vStr.substr(i, 2).toLowerCase();
                    if (diphthongs.includes(digraph)) {
                        refinedChunks.push({ type: 'V', val: vStr.substr(i, 2) });
                        i += 2;
                        matched = true;
                    }
                }
                if (!matched) {
                    refinedChunks.push({ type: 'V', val: vStr[i] });
                    i++;
                }
            }
        }
    }

    let result = "";
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                let isDouble = cStr.length === 2 && cStr[0].toLowerCase() === cStr[1].toLowerCase();
                
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (isDouble) {
                        result += cStr[0] + "|" + cStr[1];
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else {
                    result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // Irish
function syllabifySLWord(word) {
    if (word.length <= 1) return word;

    const vowels = 'aeiouAEOUI';
    const isV = (c, idx) => {
        if (vowels.includes(c)) return true;
        const lower = c.toLowerCase();
        if (lower === 'r') {
            let prevIsConsonant = (idx === 0) || !vowels.includes(word[idx - 1]);
            let nextIsConsonant = (idx === word.length - 1) || !vowels.includes(word[idx + 1]);
            return prevIsConsonant && nextIsConsonant;
        }
        return false;
    };

    let chunks = [];
    let currentChunk = "";
    let isVowelPhase = isV(word[0], 0);

    for (let i = 0; i < word.length; i++) {
        let char = word[i];
        if (isV(char, i) === isVowelPhase) {
            currentChunk += char;
        } else {
            chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });
            currentChunk = char;
            isVowelPhase = isV(char, i);
        }
    }
    chunks.push({ type: isVowelPhase ? 'V' : 'C', val: currentChunk });

    const startsSyllable = cluster => {
        const lower = cluster.toLowerCase();
        if (lower.length === 2) {
            const c1 = lower[0];
            const c2 = lower[1];
            if ('bcdfgjklmnprstvz'.includes(c1) && 'lr'.includes(c2)) return true;
        }
        return false;
    };

    let result = "";
    let refinedChunks = chunks;
    for (let i = 0; i < refinedChunks.length; i++) {
        let chunk = refinedChunks[i];
        if (chunk.type === 'V') {
            result += chunk.val;
            if (i + 1 < refinedChunks.length && refinedChunks[i+1].type === 'V') {
                result += "|";
            }
        } else {
            let cStr = chunk.val;
            let hasVBefore = (i > 0 && refinedChunks[i-1].type === 'V');
            let hasVAfter = false;
            for (let j = i + 1; j < refinedChunks.length; j++) {
                if (refinedChunks[j].type === 'V') { hasVAfter = true; break; }
                else if (refinedChunks[j].type === 'C') { break; }
            }

            if (hasVBefore && hasVAfter) {
                let isDouble = cStr.length === 2 && cStr[0].toLowerCase() === cStr[1].toLowerCase();
                
                if (cStr.length === 1) {
                    result += "|" + cStr;
                } else if (cStr.length === 2) {
                    if (isDouble) {
                        result += cStr[0] + "|" + cStr[1];
                    } else if (startsSyllable(cStr)) {
                        result += "|" + cStr;
                    } else {
                        result += cStr[0] + "|" + cStr[1];
                    }
                } else if (cStr.length === 3) {
                    if (startsSyllable(cStr.substring(1, 3))) {
                        result += cStr[0] + "|" + cStr.substring(1);
                    } else {
                        result += cStr.substring(0, 2) + "|" + cStr[2];
                    }
                } else {
                    result += cStr.substring(0, 2) + "|" + cStr.substring(2);
                }
            } else {
                result += cStr;
            }
        }
    }
    return result;
} // Slovenian

/* ==========================================================================
   4. ROUTER / ENTRY POINT FOR TEXT PROCESSING
   ========================================================================== */
function processText(text, langCode) {
    if (!text) return "";
    // Unicode-aware regex to match words and non-word sequences
    const regex = /([\p{L}\p{M}]+)|([^\p{L}\p{M}]+)/gu;
    
    let match;
    let output = "";

    while ((match = regex.exec(text)) !== null) {
        if (match[1]) {
            let word = match[1];
            let processedWord = "";

            // Route to correct language syllabification function
            switch(langCode) {
                case 'el': processedWord = syllabifyGreekWord(word); break;
                case 'en': processedWord = syllabifyENWord(word); break;
                case 'fr': processedWord = syllabifyFRWord(word); break;
                case 'de': processedWord = syllabifyDEWord(word); break;
                case 'es': processedWord = syllabifyESWord(word); break;
                case 'it': processedWord = syllabifyITWord(word); break;
                case 'pt': processedWord = syllabifyPTWord(word); break;
                case 'nl': processedWord = syllabifyNLWord(word); break;
                case 'pl': processedWord = syllabifyPLWord(word); break;
                case 'ro': processedWord = syllabifyROWord(word); break;
                case 'sv': processedWord = syllabifySVWord(word); break;
                case 'da': processedWord = syllabifyDAWord(word); break;
                case 'fi': processedWord = syllabifyFIWord(word); break;
                case 'cs': processedWord = syllabifyCSWord(word); break;
                case 'hu': processedWord = syllabifyHUWord(word); break;
                case 'sk': processedWord = syllabifySKWord(word); break;
                case 'bg': processedWord = syllabifyBGWord(word); break;
                case 'hr': processedWord = syllabifyHRWord(word); break;
                case 'lt': processedWord = syllabifyLTWord(word); break;
                case 'lv': processedWord = syllabifyLVWord(word); break;
                case 'et': processedWord = syllabifyETWord(word); break;
                case 'mt': processedWord = syllabifyMTWord(word); break;
                case 'ga': processedWord = syllabifyGAWord(word); break;
                case 'sl': processedWord = syllabifySLWord(word); break;
                default: processedWord = syllabifyGenericWord(word); break;
            }
            output += processedWord;
        } else if (match[2]) {
            // Space or punctuation
            output += match[2];
        }
    }

    return output;
}

function syllabifyWord(word, langCode) {
    return processText(word, langCode || (typeof currentLang !== 'undefined' ? currentLang : 'el'));
}

