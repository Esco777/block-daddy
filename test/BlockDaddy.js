const { expect } = require("chai")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("BlockDaddy", () => {
  let blockDaddy
  let deployer, owner1

  const NAME = 'Block Daddy'
  const SYMBOL = 'BLD'

  beforeEach(async () => {
    // Setup accounts
    [deployer, owner1] = await ethers.getSigners();

    // Deploy contract
    const BlockDaddy = await ethers.getContractFactory('BlockDaddy')
    blockDaddy = await BlockDaddy.deploy('Block Daddy','BLD')

    // List a domain
    const transaction = await blockDaddy.connect(deployer).list("jack.eth", tokens(10))
    await transaction.wait()
  })
  
  describe('Deployment', () => {
    it('has a name', async () => {
      const result = await blockDaddy.name()
      expect(result).to.equal(NAME)
  
    })
  
    it('has a symbol', async () => {
      const result = await blockDaddy.symbol()
      expect(result).to.equal(SYMBOL)
    })

    it('Sets the owner', async () => {
      const result = await blockDaddy.owner()
      expect(result).to.equal(deployer.address)
    })

    it('Returns the max supply', async () => {
      const result = await blockDaddy.maxSupply()
      expect(result).to.equal(1)
    })

    it('Returns the total supply', async () => {
      const result = await blockDaddy.totalSupply()
      expect(result).to.equal(0)
    })
  })

  describe('Domain', () => {
    it('Returns domain attributes', async () => {
      let domain = await blockDaddy.getDomain(1);
      expect(domain.name).to.be.equal("jack.eth")
      expect(domain.cost).to.be.equal(tokens(10))
      expect(domain.isOwned).to.be.equal(false)
    })
  })

  describe('Minting', () => {
    const ID = 1
    const AMOUNT = ethers.utils.parseUnits("10", 'ether')

    beforeEach(async () => {
      const transaction = await blockDaddy.connect(owner1).mint(ID, { value: AMOUNT})
      await transaction.wait()
    })

    it('Updates the owner', async () => {
      const owner = await blockDaddy.ownerOf(ID)
      expect(owner).to.be.equal(owner1.address)
    })

    it('Updates the domain status', async () => {
      const domain = await blockDaddy.getDomain(ID)
      expect(domain.isOwned).to.be.equal(true)
    })

    it('Updates the contract balance', async () => {
      const result = await blockDaddy.getBalance()
      expect(result).to.be.equal(AMOUNT)
    })

    it('Updates the total supply', async () => {
      const result = await blockDaddy.totalSupply()
      expect(result).to.be.equal(ID)
    })
  })

  describe("Withdrawing", () => {
    const ID = 1
    const AMOUNT = ethers.utils.parseUnits("10", 'ether')
    let balanceBefore

    beforeEach(async () => {
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      let transaction = await blockDaddy.connect(owner1).mint(ID, { value: AMOUNT })
      await transaction.wait()

      transaction = await blockDaddy.connect(deployer).withdraw()
      await transaction.wait()
    })

    it('Updates the owner balance', async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it('Updates the contract balance', async () => {
      const result = await blockDaddy.getBalance()
      expect(result).to.equal(0)
    })
  })

})