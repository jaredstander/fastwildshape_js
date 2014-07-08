// set form fields with document.FORMID.FIELDNAME = "";

//Set variables to be used in the calc
//we want these to be global in case we need to carry them over
//and use them in any other of our functions.
//This is useful for passing information between functions,
//which we do a lot in this process
//var conventions; nbs=non-beast shape, bs=beast shape
var nbsSTR = 0;
var nbsDEX = 0;
var nbsCON = 0;
var nbsHP = 0;
var nbsAC = 0;
var nbsBAB = 0;
var nbsTouch = 0;
var nbsFF = 0;
var nbsCMB = 0;
var nbsCMD = 0;
var nbsSize;
var bsSize;
var carryOverArmor = 0;
var nbsDEXonly = 0;
var nbsSTRmod = 0;
var nbsDEXmod = 0;
//need a var for NBS CON mod.
var nbsCONmod = 0;
var newDEX = 0;
var newDEXmod = 0;
var newSTR = 0;
var newSTRmod = 0;
var newCON = 0;
var newCONmod = 0;
//I'm adding a new var; 'diffCONmod'
//The reason being, if I only use the new CON to calculate bonus HP,
//Then if the player already had CON => 12, they're getting HP for that
//lower ability mod twice. I'm updating the code to check and see what
//the difference is between the mods, because this will be what the bonus
//(of penalty) to HP should be. *updated 8/15/12
var diffCONmod = 0;
var newAC = 0;
var newATB = 0;
//bonusHP used to track calcs and see what numbers we're coming up with here.
var bonusHP = 0;
var newHP = 0;
var newTouch = 0;
var newFF = 0;
var newCMB = 0;
var newCMD = 0;
var armorOnly = 0;
var carryOverDEX = 0;
var ACsizeMod = 0;
var stealthSizeMod = 0;
var ATBsizeMod = 0;
var CMBsizeMod = 0;
var CMDsizeMod = 0;
var nbsArmor = 0;
var charHD = 0;
var creature;
var scaledSize;

function doCalc()
{
  //Pull variables from the form to use for our calc
  //We're parsing these as floats where ever applicable because we don't want the
  //program to think that every field on the Web page is filled with text data
  nbsSTR = parseFloat(document.yourStats.yourStr.value);
  nbsDEX = parseFloat(document.yourStats.yourDex.value);
  nbsCON = parseFloat(document.yourStats.yourCon.value);
  nbsHP = parseFloat(document.yourStats.yourHP.value);
  nbsAC = parseFloat(document.yourStats.yourAC.value);
  nbsBAB = parseFloat(document.yourStats.yourBAB.value);
  nbsTouch = parseFloat(document.yourStats.yourTouch.value);
  nbsFF = parseFloat(document.yourStats.yourFF.value);
  nbsCMB = parseFloat(document.yourStats.yourCMB.value);
  nbsCMD = parseFloat(document.yourStats.yourCMD.value);
  carryOverArmor = parseFloat(document.yourStats.bsArmorStack.value);
  charHD = parseFloat(document.yourStats.charHD.value);
  creature = document.yourStats.animalSize.value;

  //Set sizes, both for you and the creature you're becoming.
  //We do this by grabbing the first character from the name of the
  //size drop-down on the web page. These are named so that the first
  //letter of the size is used, then the type of creature after
  nbsSize = setSize(document.yourStats.yourSize.value);
  bsSize = setSize(document.yourStats.animalSize.value);

  //We are going to need the dex-only and armor-only AC scores in
  //order to increment the new AC, touch, and flat-footed stats
  //properly in the future. So before we formally start increasing
  //stats, let's use some clever subtraction to figure those out.

  //total AC, minus flat-footed AC gived the armor-only AC score
  nbsDEXonly = parseFloat(nbsAC - nbsFF);

  //And, what is the raw dex ability mod? (which contributed to AC directly)
  nbsDEXmod = getAbilityMod(nbsDEX);

  //What is the raw CON ability mod? This is important for figureing out
  //the new HP, and something I omitted before. The reason why is because
  //if the original character has, say 12 CON, and the shape creature gives a +4
  //bonus to CON, then we're only adding bonus HP for 2 CON, the difference between the two.
  nbsCONmod = getAbilityMod(nbsCON);

  //Now that we have these, we can subtract the raw dex mod from the dex only figure
  //to tell us if the character has any dex bonuses to armor we might need to carry over, such
  //as from the dodge feat. We don't need to do this for the armor because the Wild Armor
  //field on the from already specifies how many armor points will carry over to wild shape.
  carryOverDEX = parseFloat(nbsDEXonly - nbsDEXmod);

  //
  //EXTRA step. Added 7/13 (FRIDAY THE 13th!!!)
  //Now that the Advanced Race Guide has come out (referred to as ARG)
  //Players will be coming in all shapes and sizes.
  //... mostly in all SIZES.
  //That means this calc, in order to serve all of our awesome Pathfinder players
  //needs to canvas all possible sizes;
  //fine, diminutive, tiny, small, medium, large, huge, gargantuan, and colossal

  //So, continuing, we want to be able to let creatures of any size,
  //not just medium or small, use this calc.
  //This page: http://paizo.com/pathfinderRPG/prd/magic.html#polymorph
  //provides adjustment modifiers for all of the non-medium or small sizes.
  //In light of this, before we proceed, let's make sure that the player is one of these extraneous sizes,
  //because if not, there's no need to do these modifications at all.
  //If so, then we'll go ahead and execute the function to pre-modify the player's size.
  if(nbsSize != "small" && nbsSize != "medium")
  {
    applyPreWSSizeMod();
  }
  else
  {
    scaledSize = "Does Not Apply";
  }
  //Note: These size modifications will be applied directly to the 'nbs' variables.
  //I decided not to add an additional variable for this because, for all intents and purposes,
  //these modifications represent what the base stats for the wild shape calculation will be.
  //It's just easier to add this step in to the raw stats before getting into the nitty-gritty


  //First thing's first. Even if someone is beast shaping
  //(wild shaping, etc) into the same size, there is
  //still a mod that needs to be applied. These are usually listed
  //on the page detailing the ability, such as:
  //http://www.d20pfsrd.com/classes/core-classes/druid#TOC-Wild-Shape-Su-
  //which gives links to the individual spells which modify your raw stats and your form.
  //Now, these increases are raw stat increases,
  //not ability mod increases, so even before we
  //find out what the ability increase or decrease is to a score
  //lets apply these raw increases and decreases.
  applyCreatureMods();


  //Now that we have the new scores for DEX, CON, and STR, we can figure out
  //the new ability modifiers these new stats provide
  newDEXmod = getAbilityMod(newDEX);
  newSTRmod = getAbilityMod(newSTR);
  newCONmod = getAbilityMod(newCON);


  //Now that this change has been applied, we see if the character's size has changed. While beast
  //shape always changes stats, even for turning into a creature of the same size, there are other
  //size-related stats that only change if the size of a character changes. These stats are;
  //AC, attack bonus, CMD, CMB, and stealth. We are essentially checking to see if the overall size of
  //the character has changes. If it did, we apply size modifiers, but if it didn't, we don't.
  getSizeMods();


  //CON / HP calculation:
  //CONABILITYMODDIFFERENCE x HITDICE = BONUSHP
  //NEW HP = OLDHP + BONUSHP

  newAC = parseFloat(10 + (carryOverDEX + (newDEXmod + armorOnly)));
  newATB = parseFloat(newSTRmod + nbsBAB);
  newTouch = parseFloat(10 + (newDEXmod + carryOverDEX));
  newFF = parseFloat(10 + armorOnly);
  newCMB = parseFloat(nbsBAB + newSTRmod);
  newCMD = parseFloat(10 + (nbsBAB + (newSTRmod + (newDEXmod + carryOverDEX))));

  //So, this is a bit of a change from the old code.
  //We're going to be updating the stats regardless,
  //so always do that, no 'IF' required
  //But if the size mod is needed too? Apply this afterwards,
  //and just += the base changes. Done and done.
  if(nbsSize != bsSize)
  {
    newAC += ACsizeMod;
    newATB += ATBsizeMod;
    newTouch += ACsizeMod;
    newFF += ACsizeMod;
    newCMB += CMBsizeMod;
    newCMD += CMDsizeMod;
  }

  diffCONmod = parseFloat(newCONmod - nbsCONmod);
  bonusHP = parseFloat(diffCONmod * charHD);
  newHP = parseFloat(nbsHP + bonusHP);

  //OK, now that we have all of the new stats, let's output them to the form on
  //the web page so the user can see them. That's it! We're done! Phew! =D
  setOutput();
}



  //This is where the function are defined.
  //Functions ahead.



function setSize(size)
{
  //Set sizes, both for you and the creature you're becoming.
  //We do this by grabbing the first character from the name of the
  //size drop-down on the web page. These are named so that the first
  //letter of the size is used, then the type of creature after
  if(size.charAt(0) == "f")
  {
    return "fine";
  }
  else if(size.charAt(0) == "d")
  {
    return "diminutive";
  }
  else if(size.charAt(0) == "t")
  {
    return "tiny";
  }
  else if(size.charAt(0) == "s")
  {
    return "small";
  }
  else if(size.charAt(0) == "m")
  {
    return "medium";
  }
  else if(size.charAt(0) == "l")
  {
    return "large";
  }
  else if(size.charAt(0) == "h")
  {
    return "huge";
  }
  else if(size.charAt(0) == "g")
  {
    return "gargantuan";
  }
  else if(size.charAt(0) == "c")
  {
    return "colossal";
  }
}

function getAbilityMod(abilityScore)
{
  return parseFloat((Math.floor(abilityScore / 2)) - 5);
}

function applyCreatureMods()
{
  //First thing's first. Even if someone is beast shaping
  //(wild shaping, etc) into the same size, there is
  //still a mod that needs to be applied.
  //No, these increases are raw stat increases,
  //not ability mod increases, so even before we
  //find out what the ability increase or decrease is to a score
  //lets apply these raw increases and decreases.

  if(creature == "dAN")
  {
    newDEX = parseFloat(nbsDEX + 6);
    newSTR = parseFloat(nbsSTR - 4);
    newCON = parseFloat(nbsCON);
    armorOnly = parseFloat(carryOverArmor + 1);
  }
  else if(creature == "tAN")
  {
    newDEX = parseFloat(nbsDEX + 4);
    newSTR = parseFloat(nbsSTR - 2);
    newCON = parseFloat(nbsCON);
    armorOnly = parseFloat(carryOverArmor + 1);
  }
  else if(creature == "sAN")
  {
    newDEX = parseFloat(nbsDEX + 2);
    newSTR = parseFloat(nbsSTR);
    newCON = parseFloat(nbsCON);
    armorOnly = parseFloat(carryOverArmor + 1);
  }
  else if(creature == "mAN")
  {
    newDEX = parseFloat(nbsDEX);
    newSTR = parseFloat(nbsSTR + 2);
    newCON = parseFloat(nbsCON);
    armorOnly = parseFloat(carryOverArmor + 2);
  }
  else if(creature == "lAN")
  {
    newDEX = parseFloat(nbsDEX - 2);
    newSTR = parseFloat(nbsSTR + 4);
    newCON = parseFloat(nbsCON);
    armorOnly = parseFloat(carryOverArmor + 4);
  }
  else if(creature == "hAN")
  {
    newDEX = parseFloat(nbsDEX - 4);
    newSTR = parseFloat(nbsSTR + 6);
    newCON = parseFloat(nbsCON);
    armorOnly = parseFloat(carryOverArmor + 6);
  }
  else if(creature == "tMB")
  {
    newDEX = parseFloat(nbsDEX + 8);
    newSTR = parseFloat(nbsSTR - 2);
    newCON = parseFloat(nbsCON);
    armorOnly = parseFloat(carryOverArmor + 3);
  }
  else if(creature == "sMB")
  {
    newDEX = parseFloat(nbsDEX + 4);
    newSTR = parseFloat(nbsSTR);
    newCON = parseFloat(nbsCON);
    armorOnly = parseFloat(carryOverArmor + 2);
  }
  else if(creature == "mMB")
  {
    newDEX = parseFloat(nbsDEX);
    newSTR = parseFloat(nbsSTR + 4);
    newCON = parseFloat(nbsCON);
    armorOnly = parseFloat(carryOverArmor + 4);
  }
  else if(creature == "lMB")
  {
    newDEX = parseFloat(nbsDEX - 2);
    newSTR = parseFloat(nbsSTR + 6);
    newCON = parseFloat(nbsCON + 2);
    armorOnly = parseFloat(carryOverArmor + 6);
  }
  else if(creature == "sAE")
  {
    newDEX = parseFloat(nbsDEX + 2);
    newSTR = parseFloat(nbsSTR);
    newCON = parseFloat(nbsCON);
    armorOnly = parseFloat(carryOverArmor + 2);
  }
  else if(creature == "sEE")
  {
    newDEX = parseFloat(nbsDEX);
    newSTR = parseFloat(nbsSTR + 2);
    newCON = parseFloat(nbsCON);
    armorOnly = parseFloat(carryOverArmor + 4);
  }
  else if(creature == "sFE")
  {
    newDEX = parseFloat(nbsDEX + 2);
    newSTR = parseFloat(nbsSTR);
    newCON = parseFloat(nbsCON);
    armorOnly = parseFloat(carryOverArmor + 2);
  }
  else if(creature == "sWE")
  {
    newDEX = parseFloat(nbsDEX);
    newSTR = parseFloat(nbsSTR);
    newCON = parseFloat(nbsCON + 2);
    armorOnly = parseFloat(carryOverArmor + 4);
  }
  else if(creature == "mAE")
  {
    newDEX = parseFloat(nbsDEX + 4);
    newSTR = parseFloat(nbsSTR);
    newCON = parseFloat(nbsCON);
    armorOnly = parseFloat(carryOverArmor + 3);
  }
  else if(creature == "mEE")
  {
    newDEX = parseFloat(nbsDEX);
    newSTR = parseFloat(nbsSTR + 4);
    newCON = parseFloat(nbsCON);
    armorOnly = parseFloat(carryOverArmor + 5);
  }
  else if(creature == "mFE")
  {
    newDEX = parseFloat(nbsDEX + 4);
    newSTR = parseFloat(nbsSTR);
    newCON = parseFloat(nbsCON);
    armorOnly = parseFloat(carryOverArmor + 3);
  }
  else if(creature == "mWE")
  {
    newDEX = parseFloat(nbsDEX);
    newSTR = parseFloat(nbsSTR);
    newCON = parseFloat(nbsCON + 4);
    armorOnly = parseFloat(carryOverArmor + 5);
  }
  else if(creature == "lAE")
  {
    newDEX = parseFloat(nbsDEX + 4);
    newSTR = parseFloat(nbsSTR + 2);
    newCON = parseFloat(nbsCON);
    armorOnly = parseFloat(carryOverArmor + 4);
  }
  else if(creature == "lEE")
  {
    newDEX = parseFloat(nbsDEX - 2);
    newSTR = parseFloat(nbsSTR + 6);
    newCON = parseFloat(nbsCON);
    armorOnly = parseFloat(carryOverArmor + 6);
  }
  else if(creature == "lFE")
  {
    newDEX = parseFloat(nbsDEX + 4);
    newSTR = parseFloat(nbsSTR);
    newCON = parseFloat(nbsCON + 2);
    armorOnly = parseFloat(carryOverArmor + 4);
  }
  else if(creature == "lWE")
  {
    newDEX = parseFloat(nbsDEX - 2);
    newSTR = parseFloat(nbsSTR + 2);
    newCON = parseFloat(nbsCON + 6);
    armorOnly = parseFloat(carryOverArmor + 6);
  }
  else if(creature == "hAE")
  {
    newDEX = parseFloat(nbsDEX + 6);
    newSTR = parseFloat(nbsSTR + 4);
    newCON = parseFloat(nbsCON);
    armorOnly = parseFloat(carryOverArmor + 4);
  }
  else if(creature == "hEE")
  {
    newDEX = parseFloat(nbsDEX - 2);
    newSTR = parseFloat(nbsSTR + 8);
    newCON = parseFloat(nbsCON + 4);
    armorOnly = parseFloat(carryOverArmor + 6);
  }
  else if(creature == "hFE")
  {
    newDEX = parseFloat(nbsDEX + 6);
    newSTR = parseFloat(nbsSTR);
    newCON = parseFloat(nbsCON + 4);
    armorOnly = parseFloat(carryOverArmor + 4);
  }
  else if(creature == "hWE")
  {
    newDEX = parseFloat(nbsDEX - 2);
    newSTR = parseFloat(nbsSTR + 4);
    newCON = parseFloat(nbsCON + 8);
    armorOnly = parseFloat(carryOverArmor + 6);
  }
  else if(creature == "sPL")
  {
    newDEX = parseFloat(nbsDEX);
    newSTR = parseFloat(nbsSTR);
    newCON = parseFloat(nbsCON + 2);
    armorOnly = parseFloat(carryOverArmor + 2);
  }
  else if(creature == "mPL")
  {
    newDEX = parseFloat(nbsDEX);
    newSTR = parseFloat(nbsSTR + 2);
    newCON = parseFloat(nbsCON + 2);
    armorOnly = parseFloat(carryOverArmor + 2);
  }
  else if(creature == "lPL")
  {
    newDEX = parseFloat(nbsDEX);
    newSTR = parseFloat(nbsSTR + 4);
    newCON = parseFloat(nbsCON + 2);
    armorOnly = parseFloat(carryOverArmor + 4);
  }
  else if(creature == "hPL")
  {
    newDEX = parseFloat(nbsDEX - 2);
    newSTR = parseFloat(nbsSTR + 8);
    newCON = parseFloat(nbsCON + 4);
    armorOnly = parseFloat(carryOverArmor + 6);
  }
}

function applyPreWSSizeMod()
{
  //Here, we scale the size of non-medium or small creatures
  //I added a variable to this calc to let players know which size they
  //have been scaled to.
  if(nbsSize == "fine")
  {
    nbsSTR += parseFloat(6);
    nbsDEX += parseFloat(-6);
    scaledSize = "Small";
  }
  else if(nbsSize == "diminutive")
  {
    nbsSTR += parseFloat(6);
    nbsDEX += parseFloat(-4);
    scaledSize = "Small";
  }
  else if(nbsSize == "tiny")
  {
    nbsSTR += parseFloat(4);
    nbsDEX += parseFloat(-2);
    scaledSize = "Small";
  }
  else if(nbsSize == "large")
  {
    nbsSTR += parseFloat(-4);
    nbsDEX += parseFloat(2);
    nbsCON += parseFloat(-2);
    scaledSize = "Medium";
  }
  else if(nbsSize == "huge")
  {
    nbsSTR += parseFloat(-8);
    nbsDEX += parseFloat(4);
    nbsCON += parseFloat(-4);
    scaledSize = "Medium";
  }
  else if(nbsSize == "gargantuan")
  {
    nbsSTR += parseFloat(-12);
    nbsDEX += parseFloat(4);
    nbsCON += parseFloat(-6);
    scaledSize = "Medium";
  }
  else if(nbsSize == "colossal")
  {
    nbsSTR += parseFloat(-16);
    nbsDEX += parseFloat(4);
    nbsCON += parseFloat(-8);
    scaledSize = "Medium";
  }
}

function getSizeMods()
{
  //Now that this change has been applied, we need to prepare the stat
  //changes which occur when a character changes size. These are not listed
  //with the wild shape, beast shape, elemental body, or plant shape spells,
  //but if any character changes its size for any reasons, changes to AC,
  //Stealth, CMB, CMD, and Attack Bonus all occur.
  if(bsSize == "diminutive")
  {
    ACsizeMod = parseFloat(4);
    stealthSizeMod = parseFloat(12);
    ATBsizeMod = parseFloat(4);
    CMBsizeMod = parseFloat(-4);
    CMDsizeMod = parseFloat(-4);
  }
  else if(bsSize == "tiny")
  {
    ACsizeMod = parseFloat(2);
    stealthSizeMod = parseFloat(8);
    ATBsizeMod = parseFloat(2);
    CMBsizeMod = parseFloat(-2);
    CMDsizeMod = parseFloat(-2);
  }
  else if(bsSize == "small")
  {
    ACsizeMod = parseFloat(1);
    stealthSizeMod = parseFloat(4);
    ATBsizeMod = parseFloat(1);
    CMBsizeMod = parseFloat(-1);
    CMDsizeMod = parseFloat(-1);
  }
  else if(bsSize == "medium")
  {
    ACsizeMod = parseFloat(0);
    stealthSizeMod = parseFloat(0);
    ATBsizeMod = parseFloat(0);
    CMBsizeMod = parseFloat(0);
    CMDsizeMod = parseFloat(0);
  }
  else if(bsSize == "large")
  {
    ACsizeMod = parseFloat(-1);
    stealthSizeMod = parseFloat(-4);
    ATBsizeMod = parseFloat(-1);
    CMBsizeMod = parseFloat(1);
    CMDsizeMod = parseFloat(1);
  }
  else if(bsSize == "huge")
  {
    ACsizeMod = parseFloat(-2);
    stealthSizeMod = parseFloat(-8);
    ATBsizeMod = parseFloat(-2);
    CMBsizeMod = parseFloat(2);
    CMDsizeMod = parseFloat(2);
  }
}

function setOutput()
{
  //OK, now that we have all of the new stats, let's output them to the form on
  //the web page so the user can see them. That's it! We're done! Phew! =D
  document.newStats.scaledSize.value = scaledSize;
  document.newStats.newStr.value = newSTR;
  document.newStats.newDex.value = newDEX;
  document.newStats.newCon.value = newCON;
  document.newStats.newHP.value = newHP;
  document.newStats.newATB.value = newATB;
  document.newStats.newAC.value = newAC;
  document.newStats.newTouch.value = newTouch;
  document.newStats.newFF.value = newFF;
  document.newStats.newCMB.value = newCMB;
  document.newStats.newCMD.value = newCMD;
  document.newStats.newStealth.value = stealthSizeMod;
}

function stealthAlert()
{
  alert("This number is only the size modification to your Stealth.\nBecause of skill points, armor check penalties, etc., it's not\nentirely possible to calculate your full Stealth check bonus.\nThis number should modify, NOT REPLACE your existing Stealth check.");
}

function sizeScaleAlert()
{
  alert("Creatures which are not Small or Medium require their size be scaled to the closest of these two sizes before applying Wild Shape stats.\nPlease see the following page for reference: http://paizo.com/pathfinderRPG/prd/magic.html#polymorph");
}